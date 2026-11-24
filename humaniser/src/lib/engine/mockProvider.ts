import "server-only";
/**
 * Deterministic stand-in for the LLM, used ONLY for automated UI/end-to-end
 * tests and offline demos. Enabled solely by HUMANISER_MOCK=1, and the UI shows
 * a visible "Demo engine" badge whenever it is active, so it can never be
 * mistaken for the real rewriting engine.
 */
import { EngineError, type LLMProvider, type StructuredRequest, type TextRequest } from "./provider";
import { sentenceTexts } from "./text";

const SWAPS: [RegExp, string][] = [
  [/\bIt is important to note that\s+(\w)/g, "$1"],
  [/\bIn today's fast-paced world,\s+(\w)/gi, "$1"],
  [/\butilise\b/g, "use"],
  [/\butilize\b/g, "use"],
  [/\bFurthermore, /g, "Also, "],
  [/\bMoreover, /g, "And "],
  [/\bin order to\b/g, "to"],
  [/\bplays a crucial role in\b/g, "matters for"],
  [/\bdelve into\b/g, "explore"],
  [/\ba myriad of\b/g, "many"],
  [/\bdue to the fact that\b/g, "because"],
];

function between(s: string, tag: string): string {
  const m = s.match(new RegExp(`<${tag}>\\n?([\\s\\S]*?)\\n?</${tag}>`));
  return m ? m[1] : "";
}

function mockRewrite(text: string, alt: number): string {
  let out = text;
  for (const [re, rep] of SWAPS) out = out.replace(re, (...args) => {
    const m = args.slice(1, -2) as string[];
    return rep.replace(/\$1/g, m[0] ? m[0].toUpperCase() : "");
  });
  if (alt > 0) out = out.replace(/\bAlso, /g, "On top of that, ").replace(/\bvery\b/g, "really");
  return out;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new EngineError("aborted", "Request cancelled.", 499));
    });
  });

export class MockProvider implements LLMProvider {
  readonly name = "mock";
  readonly model = "demo-engine";
  readonly isMock = true;

  async generateText(req: TextRequest): Promise<string> {
    const source = between(req.user, "source_text") || between(req.user, "revision");
    if (source.includes("[[mock-error]]")) {
      await sleep(150, req.signal);
      throw new EngineError("overloaded", "The AI provider is temporarily unavailable or overloaded. Please retry shortly.", 503);
    }
    const alt = (req.user.match(/<version n=/g) ?? []).length;
    const body = req.user.includes("<problems>") ? source : mockRewrite(source, alt);
    const full = `<rewrite>\n${body}\n</rewrite>`;
    let acc = "";
    const chunks = full.match(/[\s\S]{1,24}/g) ?? [];
    for (const c of chunks) {
      await sleep(12, req.signal);
      acc += c;
      req.onText?.(acc);
    }
    return full;
  }

  async generateStructured<T>(req: StructuredRequest<T>): Promise<T> {
    await sleep(120, req.signal);
    if (req.user.includes("<target>")) {
      const target = between(req.user, "target").trim();
      const base = mockRewrite(target, 0);
      return req.schema.parse({
        options: [
          { text: base.replace(/\s+/g, " "), approach: "Tighter" },
          { text: base.replace(/^(\w+)/, (w) => w), approach: "Restructured" },
          { text: base, approach: "Smoother link" },
        ],
      });
    }
    const original = between(req.user, "original");
    const points = sentenceTexts(original)
      .slice(0, 6)
      .map((s) => ({ point: s.split(/\s+/).slice(0, 12).join(" "), status: "retained" as const }));
    return req.schema.parse({
      key_points: points,
      issues: [],
      tone_adherence: "good",
      naturalness: 4,
      summary: "Demo engine: all key points were kept.",
    });
  }
}
