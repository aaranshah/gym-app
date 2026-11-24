/**
 * Offline evaluation of the deterministic fidelity checker on the 20-category
 * quality dataset (eval/dataset.json):
 *  1. Identity: an unchanged text must raise no findings at all.
 *  2. False alarms: a hand-written, faithful reference rewrite must raise no
 *     HARD findings (hard findings force a correction pass, so false alarms
 *     cost latency and can make the editor undo good changes).
 *  3. Detection: systematic meaning-breaking corruptions of the reference must
 *     be caught.
 */
import { describe, expect, it } from "vitest";
import dataset from "../../eval/dataset.json";
import { checkFidelity } from "@/lib/engine/fidelity";
import { SettingsSchema } from "@/lib/engine/options";

type Sample = (typeof dataset)[number];
const settingsFor = (s: Sample) => SettingsSchema.parse(s.settings);

type Corruption = { name: string; expect: "hard" | "warn"; apply: (t: string) => string | null };

const CORRUPTIONS: Corruption[] = [
  {
    name: "number changed",
    expect: "hard",
    apply: (t) => {
      const m = t.match(/\b\d+(?:[.,]\d+)?\b/);
      if (!m) return null;
      const n = String(Number(m[0].replace(/,/g, "")) + 7);
      return t.replace(m[0], n);
    },
  },
  {
    name: "hedge removed",
    expect: "warn",
    apply: (t) => {
      if (/\bmay\b/.test(t)) return t.replace(/\bmay\b/, "will");
      if (/\bsuggests?\b/.test(t)) return t.replace(/\bsuggests?\b/, "proves");
      if (/\bappears to\b/.test(t)) return t.replace(/\bappears to\b/, "does");
      return null;
    },
  },
  {
    name: "negation dropped",
    expect: "warn",
    apply: (t) => {
      if (/\b(is|was|did|does|are|were) not\b/.test(t)) return t.replace(/\b(is|was|did|does|are|were) not\b/, "$1");
      if (/n't\b/.test(t)) return t.replace(/(\w+)n't\b/, "$1");
      return null;
    },
  },
  {
    name: "citation dropped",
    expect: "hard",
    apply: (t) => {
      const m = t.match(/\s?\([A-Z][^()]*\d{4}[^()]*\)|\s?\[\d+\]/);
      return m ? t.replace(m[0], "") : null;
    },
  },
  {
    name: "quotation altered",
    expect: "hard",
    apply: (t) => {
      const m = t.match(/"([^"]+)"/);
      if (!m) return null;
      return t.replace(m[1], m[1].replace(/\bwill not\b/, "will").replace(/\bthe\b/, "a"));
    },
  },
  {
    name: "condition dropped",
    expect: "warn",
    apply: (t) => (/\bunless\b/i.test(t) ? t.replace(/,?\s*unless[^.]*\./i, ".") : /\bonly applies if\b/.test(t) ? t.replace("only applies if", "applies when") : null),
  },
  {
    name: "correlation → causation",
    expect: "warn",
    apply: (t) => (/\bis associated with\b/.test(t) ? t.replace(/\bis associated with\b/, "causes") : null),
  },
];

describe("checker evaluation on the quality dataset", () => {
  const rows: string[] = [];
  let refWarnings = 0;
  let corruptionsApplied = 0;
  let corruptionsCaught = 0;

  for (const s of dataset) {
    const settings = settingsFor(s);
    it(`${s.id}: identity raises nothing`, () => {
      const r = checkFidelity(s.text, s.text, settings);
      expect(r.findings).toEqual([]);
    });
    it(`${s.id}: faithful reference raises no hard findings`, () => {
      const r = checkFidelity(s.text, s.reference, settings);
      expect(r.hard.map((f) => f.message)).toEqual([]);
      refWarnings += r.warnings.length;
      if (r.warnings.length) rows.push(`  [ref warn] ${s.id}: ${r.warnings.map((w) => w.category).join(", ")}`);
    });
    for (const c of CORRUPTIONS) {
      const bad = c.apply(s.reference);
      if (bad === null || bad === s.reference) continue;
      it(`${s.id}: detects "${c.name}"`, () => {
        corruptionsApplied++;
        const r = checkFidelity(s.text, bad, settings);
        const pool = c.expect === "hard" ? r.hard : r.findings;
        if (pool.length) corruptionsCaught++;
        expect(pool.length, `corruption "${c.name}" not detected in: ${bad}`).toBeGreaterThan(0);
      });
    }
  }

  it("summary", () => {
    console.log(
      [
        `Checker eval: ${dataset.length} samples`,
        `  hard false alarms on faithful references: 0 (asserted)`,
        `  heuristic warnings on faithful references: ${refWarnings} (passed to the AI reviewer, not auto-corrected)`,
        ...rows,
        `  corruptions detected: ${corruptionsCaught}/${corruptionsApplied}`,
      ].join("\n"),
    );
  });
});
