import { describe, expect, it } from "vitest";
import {
  checkFidelity,
  extractCitations,
  extractNumbers,
  extractQuotes,
} from "@/lib/engine/fidelity";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/engine/options";

const S = (o: Partial<Settings> = {}): Settings => ({ ...DEFAULT_SETTINGS, ...o });
const cats = (r: ReturnType<typeof checkFidelity>, sev: "hard" | "warn") =>
  (sev === "hard" ? r.hard : r.warnings).map((f) => f.category);

describe("extractNumbers", () => {
  it("normalises separators, percentages, currency and scale words", () => {
    const keys = extractNumbers("Revenue rose 12.5% to $3,400 in 2021, about 3 million users and 45 per cent growth.").map(
      (n) => n.key,
    );
    expect(keys).toEqual(["12.5%", "$3400", "2021", "3000000", "45%"]);
  });
  it("ignores digits glued to letters (terminology like COVID-19, H2O)", () => {
    expect(extractNumbers("H2O and GPT4 are terms").map((n) => n.key)).toEqual([]);
  });
});

describe("extractCitations / quotes", () => {
  it("finds author–year, narrative and numeric citations", () => {
    const c = extractCitations("Prior work (Smith & Lee, 2019; Wong et al., 2020a) and Patel (2018) agree [3, 5].").map(
      (x) => x.label,
    );
    expect(c).toEqual(expect.arrayContaining(["Smith (2019)", "Wong (2020a)", "Patel (2018)", "[3,5]"]));
  });
  it("extracts double-quoted passages of 3+ words, with curly quotes", () => {
    expect(extractQuotes("He said “the data are not conclusive” and left.")).toEqual(["the data are not conclusive"]);
  });
});

describe("checkFidelity — good rewrites should pass without hard findings", () => {
  const cases: [string, string, string][] = [
    [
      "academic hedged claim",
      "It is important to note that the results suggest that sleep duration may be associated with academic performance (Smith, 2020). However, further research is needed.",
      "The results suggest that sleep duration may be associated with academic performance (Smith, 2020), though more research is needed.",
    ],
    [
      "statistics restated",
      "Furthermore, approximately 45% of respondents, or 1,200 people, reported that they did not use the service in 2022.",
      "About 45% of respondents (1,200 people) said they did not use the service in 2022.",
    ],
    [
      "email",
      "I hope this email finds you well. I am writing to inform you that the meeting has been moved to Thursday at 3 pm.",
      "Just a quick note: the meeting has moved to Thursday at 3 pm.",
    ],
    [
      "number words in rewrite count",
      "The team consists of 3 engineers and 2 designers.",
      "The team has three engineers and two designers.",
    ],
  ];
  for (const [name, original, rewrite] of cases) {
    it(name, () => {
      const r = checkFidelity(original, rewrite, S());
      expect(r.hard).toEqual([]);
    });
  }
});

describe("checkFidelity — bad rewrites must be caught", () => {
  it("changed number", () => {
    const r = checkFidelity("Sales grew by 14% in 2023.", "Sales grew by 41% in 2023.", S());
    expect(cats(r, "hard")).toContain("number");
  });
  it("invented statistic", () => {
    const r = checkFidelity("Many users liked the update.", "Many users (over 80%) liked the update.", S());
    expect(r.hard.some((f) => f.message.includes("New number"))).toBe(true);
  });
  it("altered quotation", () => {
    const r = checkFidelity(
      'The minister said "we will review the policy next year" in parliament.',
      'The minister said "we will change the policy next year" in parliament.',
      S(),
    );
    expect(cats(r, "hard")).toContain("quote");
  });
  it("dropped citation", () => {
    const r = checkFidelity(
      "Exercise improves mood (Garcia et al., 2021).",
      "Exercise improves mood.",
      S(),
    );
    expect(cats(r, "hard")).toContain("citation");
  });
  it("hedge removed and absolute added", () => {
    const r = checkFidelity(
      "The new drug may reduce symptoms in some patients.",
      "The new drug will reduce symptoms in all patients.",
      S(),
    );
    expect(cats(r, "warn")).toContain("certainty");
  });
  it("correlation turned into causation", () => {
    const r = checkFidelity(
      "Screen time is associated with poorer sleep in teenagers.",
      "Screen time causes poorer sleep in teenagers.",
      S(),
    );
    expect(cats(r, "warn")).toContain("causation");
  });
  it("negation flipped", () => {
    const r = checkFidelity("The treatment did not improve outcomes.", "The treatment improved outcomes.", S());
    expect(cats(r, "warn")).toContain("negation");
  });
  it("protected phrase changed", () => {
    const r = checkFidelity(
      "Our Customer Success Programme starts in May.",
      "Our customer support scheme starts in May.",
      S({ protectedPhrases: ["Customer Success Programme"] }),
    );
    expect(cats(r, "hard")).toContain("protected");
  });
  it("paragraph structure changed when it should be preserved", () => {
    const r = checkFidelity("First para.\n\nSecond para here.", "First para. Second para here.", S());
    expect(cats(r, "hard")).toContain("structure");
    const r2 = checkFidelity("First para.\n\nSecond para here.", "First para. Second para here.", S({ preserveParagraphs: false }));
    expect(cats(r2, "hard")).not.toContain("structure");
  });
  it("length target respected", () => {
    const original = Array.from({ length: 100 }, (_, i) => `word${i % 7}`).join(" ").replace(/\d/g, "");
    const r = checkFidelity(original, original.split(" ").slice(0, 40).join(" "), S());
    expect(cats(r, "warn")).toContain("length");
  });
});

describe("checkFidelity — edge cases", () => {
  it("treats 3 pm and 3:00 pm as the same time, but catches 2:30 → 3:30", () => {
    expect(checkFidelity("Meet at 3 pm today.", "Meet at 3:00 pm today.", S()).hard).toEqual([]);
    expect(checkFidelity("Meet at 2:30 pm.", "Meet at 3:30 pm.", S()).hard.length).toBeGreaterThan(0);
  });
  it("does not treat decimals as times", () => {
    expect(extractNumbers("It rose 3.25 points").map((n) => n.key)).toEqual(["3.25"]);
  });
  it("downgrades number findings to warnings when translating", () => {
    const r = checkFidelity("It grew 3.5% last year.", "Es wuchs letztes Jahr um 3,5 %.", S({ language: "German" }));
    expect(r.hard).toEqual([]);
    expect(r.warnings.some((w) => w.category === "number")).toBe(true);
  });
  it("catches causal upgrade even when the source mentions causation hypothetically", () => {
    const r = checkFidelity(
      "Use is associated with anxiety, but it is unclear whether use causes anxiety.",
      "Use causes anxiety, but it is unclear whether use causes anxiety.",
      S(),
    );
    expect(cats(r, "warn")).toContain("causation");
  });
});
