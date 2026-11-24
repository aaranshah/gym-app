import "server-only";
import { checkFidelity, type DeterministicReport, type Finding } from "./fidelity";
import type { HumaniseRequest, SentenceRequest, Settings } from "./options";
import {
  CORRECT_SYSTEM,
  REWRITE_SYSTEM,
  SENTENCE_SYSTEM,
  VERIFY_SYSTEM,
  buildCorrectUser,
  buildRewriteUser,
  buildSentenceUser,
  buildVerifyUser,
  extractRewrite,
} from "./prompts";
import { EngineError, type Effort, type LLMProvider } from "./provider";
import { SentenceOptionsSchema, VerificationSchema, type Verification } from "./schemas";
import { analyseStyle, styleObservations } from "./style";
import { countWords } from "./text";
import type { HumaniseResult, PipelineEvent, ReportIssue, SentenceResult } from "./types";

export const MAX_CORRECTION_PASSES = 2;

const REWRITE_EFFORT: Record<Settings["intensity"], Effort> = {
  light: "low",
  balanced: "medium",
  deep: "high",
};

/** Text that is visible to the user while the model streams `<rewrite>…</rewrite>`. */
export function visibleStreamText(full: string): string {
  const open = full.indexOf("<rewrite>");
  if (open === -1) return "";
  let body = full.slice(open + "<rewrite>".length).replace(/^\n/, "");
  const close = body.indexOf("</rewrite>");
  if (close !== -1) body = body.slice(0, close);
  else body = body.replace(/<\/?[a-z]*$/i, "");
  return body;
}

interface Candidate {
  text: string;
  det: DeterministicReport;
  verification: Verification | null;
  blocking: number;
}

export async function runHumanise(
  provider: LLMProvider,
  req: HumaniseRequest,
  emit: (e: PipelineEvent) => void,
  signal?: AbortSignal,
): Promise<HumaniseResult> {
  const started = Date.now();
  const { text, settings, previousVersions } = req;
  const sourceWords = countWords(text);
  const before = analyseStyle(text);

  // Stage A–D: analysis happens inside the rewrite call (adaptive thinking),
  // guided by deterministic style observations; the draft streams to the user.
  emit({ type: "stage", stage: "rewriting" });
  let sent = "";
  const raw = await provider.generateText({
    system: REWRITE_SYSTEM,
    user: buildRewriteUser({
      text,
      settings,
      sourceWords,
      observations: styleObservations(before),
      previousVersions,
    }),
    effort: REWRITE_EFFORT[settings.intensity],
    maxTokens: 64_000,
    signal,
    onText: (full) => {
      // Hold back trailing whitespace so a final newline before </rewrite> is never streamed.
      const visible = visibleStreamText(full).replace(/\s+$/, "");
      if (visible.length > sent.length && visible.startsWith(sent)) {
        emit({ type: "delta", text: visible.slice(sent.length) });
        sent = visible;
      }
    },
  });
  let draft = extractRewrite(raw);
  if (!draft.trim()) throw new EngineError("invalid_output", "The model returned an empty rewrite. Please try again.", 502);

  // Stage E–F: verify, then correct up to MAX_CORRECTION_PASSES times.
  const candidates: Candidate[] = [];
  let corrections = 0;
  let verifyFailed = false;
  for (let pass = 0; pass <= MAX_CORRECTION_PASSES; pass++) {
    const det = checkFidelity(text, draft, settings);
    emit({ type: "stage", stage: "verifying", pass });
    let verification: Verification | null = null;
    try {
      verification = await provider.generateStructured({
        system: VERIFY_SYSTEM,
        user: buildVerifyUser({ original: text, revised: draft, settings, sourceWords, flags: det.findings }),
        schema: VerificationSchema,
        effort: "medium",
        maxTokens: 16_000,
        signal,
      });
    } catch (err) {
      // Degrade gracefully: deliver the draft with deterministic checks only.
      if (err instanceof EngineError && err.code === "aborted") throw err;
      verifyFailed = true;
    }
    const blockingIssues = (verification?.issues ?? []).filter((i) => i.severity !== "minor");
    const blocking = det.hard.length + blockingIssues.length;
    candidates.push({ text: draft, det, verification, blocking });

    if (blocking === 0 || pass === MAX_CORRECTION_PASSES || verifyFailed) break;

    emit({ type: "stage", stage: "refining", pass: pass + 1 });
    const problems = [
      ...det.hard.map((f) => `[automated check: ${f.category}] ${f.message} Restore it exactly as in the original.`),
      ...blockingIssues.map(
        (i) =>
          `[${i.severity} · ${i.category}] Original: "${i.original_excerpt}" → Revision: "${i.revised_excerpt}". ${i.explanation} Fix: ${i.suggested_fix}`,
      ),
    ];
    const correctedRaw = await provider.generateText({
      system: CORRECT_SYSTEM,
      user: buildCorrectUser({ original: text, revised: draft, settings, sourceWords, problems }),
      effort: "medium",
      maxTokens: 64_000,
      signal,
    });
    const corrected = extractRewrite(correctedRaw);
    corrections++;
    if (!corrected.trim()) break;
    draft = corrected;
  }

  // Deliver the candidate with the fewest blocking problems (latest wins ties).
  const best = candidates.reduce((a, b) => (b.blocking <= a.blocking ? b : a));
  const after = analyseStyle(best.text);
  return {
    text: best.text,
    report: buildReport(best, corrections, verifyFailed),
    metrics: { before, after },
    meta: {
      model: provider.model,
      mock: provider.isMock,
      ms: Date.now() - started,
      correctionPasses: corrections,
    },
  };
}

function buildReport(c: Candidate, corrections: number, verifyFailed: boolean): HumaniseResult["report"] {
  const issues: ReportIssue[] = [
    ...c.det.hard.map((f) => findingToIssue(f)),
    ...(c.verification?.issues ?? []).map((i) => ({
      severity: i.severity,
      category: i.category,
      message: i.explanation,
      originalExcerpt: i.original_excerpt,
      revisedExcerpt: i.revised_excerpt,
      source: "reviewer" as const,
    })),
  ];
  const keyPoints = (c.verification?.key_points ?? []).map((k) => ({ point: k.point, status: k.status }));
  const serious = issues.filter((i) => i.severity !== "minor").length;
  return {
    status: verifyFailed || !c.verification ? "unverified" : serious > 0 ? "issues" : "verified",
    summary: c.verification?.summary ?? "Automated checks only — the AI review step was unavailable.",
    keyPoints,
    issues,
    naturalness: c.verification?.naturalness ?? null,
    toneAdherence: c.verification?.tone_adherence ?? null,
    automatedChecks: {
      hard: c.det.hard.map((f) => f.message),
      warnings: c.det.warnings.map((f) => f.message),
    },
    correctionPasses: corrections,
  };
}

function findingToIssue(f: Finding): ReportIssue {
  return { severity: "major", category: f.category, message: f.message, source: "automated" };
}

export async function runSentenceRewrite(
  provider: LLMProvider,
  req: SentenceRequest,
  signal?: AbortSignal,
): Promise<SentenceResult> {
  const out = await provider.generateStructured({
    system: SENTENCE_SYSTEM,
    user: buildSentenceUser(req),
    schema: SentenceOptionsSchema,
    effort: "low",
    maxTokens: 8_000,
    signal,
  });
  // Paragraph/length rules don't apply to a single sentence; facts, quotes and citations do.
  const settings: Settings = { ...req.settings, preserveParagraphs: false, lengthMode: "same" };
  return {
    options: out.options
      .map((o) => o.text.trim())
      .filter(Boolean)
      .map((text, i) => {
        const det = checkFidelity(req.sentence, text, settings);
        return {
          text,
          approach: out.options[i]?.approach ?? "",
          warnings: det.hard.map((f) => f.message),
        };
      }),
  };
}
