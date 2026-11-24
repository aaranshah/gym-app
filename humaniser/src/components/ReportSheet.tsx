"use client";
import { AlertTriangle, CheckCircle2, CircleDashed, MinusCircle, X, XCircle } from "lucide-react";
import type { DeterministicReport } from "@/lib/engine/fidelity";
import type { StyleMetrics } from "@/lib/engine/style";
import type { HumaniseResult } from "@/lib/engine/types";
import { IconButton, cx } from "./ui";

export type FidelityView =
  | { kind: "full"; result: HumaniseResult }
  | { kind: "local"; det: DeterministicReport; before: StyleMetrics; after: StyleMetrics };

export function fidelityBadge(v: FidelityView): { tone: "ok" | "warn" | "neutral"; label: string } {
  if (v.kind === "local") {
    return v.det.hard.length
      ? { tone: "warn", label: `Edited · ${v.det.hard.length} automated flag${v.det.hard.length > 1 ? "s" : ""}` }
      : { tone: "neutral", label: "Edited · automated checks passed" };
  }
  const r = v.result.report;
  const kept = r.keyPoints.filter((k) => k.status === "retained").length;
  const serious = r.issues.filter((i) => i.severity !== "minor").length;
  if (r.status === "unverified") return { tone: "neutral", label: "Automated checks only" };
  if (serious) return { tone: "warn", label: `${serious} item${serious > 1 ? "s" : ""} to review` };
  return { tone: "ok", label: r.keyPoints.length ? `Meaning check · ${kept}/${r.keyPoints.length} key points kept` : "Meaning check passed" };
}

const STATUS_ICON = {
  retained: <CheckCircle2 size={15} className="text-ok" aria-label="kept" />,
  weakened: <MinusCircle size={15} className="text-warn" aria-label="weakened" />,
  altered: <AlertTriangle size={15} className="text-warn" aria-label="altered" />,
  missing: <XCircle size={15} className="text-danger" aria-label="missing" />,
};

export function ReportSheet({ view, onClose }: { view: FidelityView; onClose: () => void }) {
  const before = view.kind === "full" ? view.result.metrics.before : view.before;
  const after = view.kind === "full" ? view.result.metrics.after : view.after;
  const report = view.kind === "full" ? view.result.report : null;
  const automatedHard = view.kind === "full" ? report!.automatedChecks.hard : view.det.hard.map((f) => f.message);
  const automatedWarn = view.kind === "full" ? report!.automatedChecks.warnings : view.det.warnings.map((f) => f.message);
  const reviewerIssues = report?.issues.filter((i) => i.source === "reviewer") ?? [];

  return (
    <div
      role="dialog"
      aria-label="Meaning and style report"
      data-testid="report-sheet"
      className="animate-fade-up absolute inset-x-0 bottom-0 z-30 flex max-h-[78%] flex-col rounded-t-[16px] border-t border-line bg-surface shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h3 className="text-[14px] font-semibold text-ink">Meaning &amp; style report</h3>
        <IconButton label="Close report" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </div>
      <div className="scroll-thin space-y-6 overflow-y-auto px-5 py-4 text-[13.5px]">
        {report && (
          <section>
            <p className="leading-relaxed text-ink-2">{report.summary}</p>
            {report.correctionPasses > 0 && (
              <p className="mt-1.5 text-[12.5px] text-muted">
                Cadence found and corrected problems in {report.correctionPasses} refinement pass
                {report.correctionPasses > 1 ? "es" : ""} before showing you this version.
              </p>
            )}
          </section>
        )}

        {report && report.keyPoints.length > 0 && (
          <section>
            <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Key points</h4>
            <ul className="space-y-1.5">
              {report.keyPoints.map((k, i) => (
                <li key={i} className="flex items-start gap-2 text-ink-2">
                  <span className="mt-0.5 shrink-0">{STATUS_ICON[k.status]}</span>
                  <span>
                    {k.point}
                    {k.status !== "retained" && <span className="ml-1 text-[12px] font-medium text-warn">({k.status})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {reviewerIssues.length > 0 && (
          <section>
            <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Reviewer notes</h4>
            <ul className="space-y-2">
              {reviewerIssues.map((i, n) => (
                <li key={n} className={cx("rounded-[10px] px-3 py-2", i.severity === "minor" ? "bg-sunken" : "bg-warn-soft")}>
                  <p className="text-[12px] font-medium text-muted">
                    {i.severity} · {i.category.replace(/_/g, " ")}
                  </p>
                  <p className="mt-0.5 text-ink-2">{i.message}</p>
                  {i.revisedExcerpt && <p className="prose-text mt-1 text-[14px] italic text-muted">“{i.revisedExcerpt}”</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Automated checks</h4>
          <p className="mb-2 text-[12.5px] text-muted">Numbers, quotations, citations, links, protected phrases, negation, hedging and structure.</p>
          {automatedHard.length === 0 && automatedWarn.length === 0 ? (
            <p className="flex items-center gap-2 text-ink-2">
              <CheckCircle2 size={15} className="text-ok" /> No problems detected.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {automatedHard.map((m, i) => (
                <li key={`h${i}`} className="flex items-start gap-2 text-ink-2">
                  <XCircle size={15} className="mt-0.5 shrink-0 text-danger" /> {m}
                </li>
              ))}
              {automatedWarn.map((m, i) => (
                <li key={`w${i}`} className="flex items-start gap-2 text-ink-2">
                  <CircleDashed size={15} className="mt-0.5 shrink-0 text-muted" />
                  <span>
                    {m} <span className="text-[12px] text-faint">(heuristic{report ? "; reviewed by AI" : ""})</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h4 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Style, before → after</h4>
          <table className="w-full text-left text-[13px]">
            <tbody className="divide-y divide-line">
              <MetricRow label="Words" a={before.words} b={after.words} />
              <MetricRow label="Average sentence length" a={before.avgSentenceLength} b={after.avgSentenceLength} />
              <MetricRow label="Sentence length variety" a={before.sentenceLengthVariation} b={after.sentenceLengthVariation} hint="Coefficient of variation; higher = more varied rhythm." />
              <MetricRow label="Stock / overused words" a={sumHits(before.stockWordHits)} b={sumHits(after.stockWordHits)} lowerIsBetter />
              <MetricRow label="Formulaic phrases" a={sumHits(before.formulaicHits)} b={sumHits(after.formulaicHits)} lowerIsBetter />
              <MetricRow label="Trailing “-ing” clauses" a={before.participialTails} b={after.participialTails} lowerIsBetter />
              <MetricRow label="Nominalisations / 100 words" a={before.nominalisationsPer100} b={after.nominalisationsPer100} lowerIsBetter />
              <MetricRow label="Sentences opening with a transition" a={pct(before.transitionOpenerRate)} b={pct(after.transitionOpenerRate)} lowerIsBetter />
            </tbody>
          </table>
        </section>

        <p className="border-t border-line pt-3 text-[12px] leading-relaxed text-faint">
          These checks combine an AI review with pattern-based tests. They catch common problems but can miss nuance — always
          read important text yourself before using it. The style figures describe your writing; they are not an “AI detection” score.
        </p>
      </div>
    </div>
  );
}

function MetricRow({ label, a, b, lowerIsBetter, hint }: { label: string; a: number | string; b: number | string; lowerIsBetter?: boolean; hint?: string }) {
  const na = typeof a === "number" ? a : parseFloat(a);
  const nb = typeof b === "number" ? b : parseFloat(b);
  const better = lowerIsBetter && nb < na;
  return (
    <tr title={hint}>
      <td className="py-1.5 pr-3 text-ink-2">{label}</td>
      <td className="py-1.5 text-right tabular-nums text-muted">{a}</td>
      <td className="w-6 py-1.5 text-center text-faint">→</td>
      <td className={cx("py-1.5 text-right tabular-nums", better ? "font-medium text-ok" : "text-ink")}>{b}</td>
    </tr>
  );
}

const sumHits = (h: { count: number }[]) => h.reduce((a, x) => a + x.count, 0);
const pct = (n: number) => `${Math.round(n * 100)}%`;
