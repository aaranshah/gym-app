import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/engine/options";
import { runHumanise, visibleStreamText } from "@/lib/engine/pipeline";
import { EngineError, type LLMProvider, type StructuredRequest, type TextRequest } from "@/lib/engine/provider";
import type { Verification } from "@/lib/engine/schemas";
import type { PipelineEvent } from "@/lib/engine/types";

const ORIGINAL = "Sales may have grown by 14% in 2023 (Smith, 2024). It is important to note that this is not certain.";

function clean(v: Partial<Verification> = {}): Verification {
  return { key_points: [{ point: "Sales may have grown 14%", status: "retained" }], issues: [], tone_adherence: "good", naturalness: 4, summary: "ok", ...v };
}

/** Scripted provider: returns queued texts / verifications in order and records calls. */
class FakeProvider implements LLMProvider {
  name = "fake";
  model = "fake-model";
  isMock = true;
  calls: string[] = [];
  constructor(
    private texts: string[],
    private verifications: (Verification | Error)[],
  ) {}
  async generateText(req: TextRequest) {
    this.calls.push(req.user.includes("<problems>") ? "correct" : "rewrite");
    const t = this.texts.shift() ?? "";
    req.onText?.(t.slice(0, 20));
    req.onText?.(t);
    return t;
  }
  async generateStructured<T>(req: StructuredRequest<T>): Promise<T> {
    this.calls.push("verify");
    const v = this.verifications.shift() ?? clean();
    if (v instanceof Error) throw v;
    return req.schema.parse(v);
  }
}

const req = { text: ORIGINAL, settings: DEFAULT_SETTINGS, previousVersions: [] };

describe("runHumanise", () => {
  it("delivers a clean rewrite after one verification, streaming deltas", async () => {
    const good = "Sales may have grown by 14% in 2023 (Smith, 2024), though this is not certain.";
    const p = new FakeProvider([`<rewrite>\n${good}\n</rewrite>`], [clean()]);
    const events: PipelineEvent[] = [];
    const res = await runHumanise(p, req, (e) => events.push(e));
    expect(res.text).toBe(good);
    expect(res.report.status).toBe("verified");
    expect(p.calls).toEqual(["rewrite", "verify"]);
    const streamed = events.filter((e) => e.type === "delta").map((e) => (e as { text: string }).text).join("");
    expect(streamed).toBe(good);
  });

  it("runs a correction pass when a number is changed, then verifies again", async () => {
    const bad = "Sales may have grown by 41% in 2023 (Smith, 2024), though this is not certain.";
    const fixed = "Sales may have grown by 14% in 2023 (Smith, 2024), though this is not certain.";
    const p = new FakeProvider([`<rewrite>${bad}</rewrite>`, `<rewrite>${fixed}</rewrite>`], [clean(), clean()]);
    const res = await runHumanise(p, req, () => {});
    expect(p.calls).toEqual(["rewrite", "verify", "correct", "verify"]);
    expect(res.text).toBe(fixed);
    expect(res.report.correctionPasses).toBe(1);
    expect(res.report.status).toBe("verified");
  });

  it("stops after the maximum number of correction passes and returns the best candidate", async () => {
    const bad1 = "Sales grew by 41% in 2023 (Smith, 2024). This is not certain.";
    const bad2 = "Sales grew by 41% in 2023. This is not certain."; // worse: citation also dropped
    const bad3 = "Sales grew by 41% in 2023. This is uncertain."; // still bad
    const p = new FakeProvider([bad1, bad2, bad3].map((t) => `<rewrite>${t}</rewrite>`), [clean(), clean(), clean()]);
    const res = await runHumanise(p, req, () => {});
    expect(p.calls.filter((c) => c === "correct").length).toBe(2);
    expect(res.text).toBe(bad1);
    expect(res.report.status).toBe("issues");
  });

  it("treats a reviewer-reported major issue as blocking", async () => {
    const draft = "Sales grew by 14% in 2023 (Smith, 2024). This is not certain.";
    const issue = {
      severity: "major" as const,
      category: "certainty_shift" as const,
      original_excerpt: "may have grown",
      revised_excerpt: "grew",
      explanation: "Hedge removed",
      suggested_fix: "Restore 'may have grown'",
    };
    const p = new FakeProvider([`<rewrite>${draft}</rewrite>`, `<rewrite>${ORIGINAL}</rewrite>`], [clean({ issues: [issue] }), clean()]);
    const res = await runHumanise(p, req, () => {});
    expect(p.calls).toEqual(["rewrite", "verify", "correct", "verify"]);
    expect(res.report.status).toBe("verified");
  });

  it("degrades to 'unverified' (not a failure) if the review step errors", async () => {
    const good = "Sales may have grown by 14% in 2023 (Smith, 2024), though this is not certain.";
    const p = new FakeProvider([`<rewrite>${good}</rewrite>`], [new EngineError("overloaded", "busy", 503)]);
    const res = await runHumanise(p, req, () => {});
    expect(res.text).toBe(good);
    expect(res.report.status).toBe("unverified");
  });

  it("errors on an empty rewrite instead of returning nothing", async () => {
    const p = new FakeProvider(["<rewrite></rewrite>"], []);
    await expect(runHumanise(p, req, () => {})).rejects.toMatchObject({ code: "invalid_output" });
  });
});

describe("visibleStreamText", () => {
  it("hides tags and partial closing tags while streaming", () => {
    expect(visibleStreamText("Thinking<rewr")).toBe("");
    expect(visibleStreamText("<rewrite>\nHello wor")).toBe("Hello wor");
    expect(visibleStreamText("<rewrite>\nHello world</rew")).toBe("Hello world");
    expect(visibleStreamText("<rewrite>\nHello world</rewrite>")).toBe("Hello world");
  });
});
