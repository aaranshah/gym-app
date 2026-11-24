/**
 * Deterministic fidelity checks.
 *
 * LLM paraphrasers most often break meaning in a handful of predictable places:
 * numbers and units, quotations, citations, negation and degrees of certainty
 * (see README → "Research notes"). These are cheap to check mechanically, so we
 * do that on every rewrite and use the results two ways:
 *
 *  - "hard" findings are objective (a number or citation vanished, a quote was
 *    altered, a protected phrase changed). They always trigger a correction pass.
 *  - "warn" findings are heuristics (negation count changed, new absolute words).
 *    They are passed to the LLM verifier as leads to confirm or dismiss, because
 *    a legitimate rewrite can trip them.
 */
import type { Settings } from "./options";
import { countWords, normaliseQuotes, normaliseSpace, splitParagraphs } from "./text";

export type FindingCategory =
  | "number"
  | "quote"
  | "citation"
  | "url"
  | "protected"
  | "terminology"
  | "entity"
  | "certainty"
  | "negation"
  | "condition"
  | "causation"
  | "structure"
  | "length";

export interface Finding {
  category: FindingCategory;
  severity: "hard" | "warn";
  message: string;
}

export interface DeterministicReport {
  findings: Finding[];
  hard: Finding[];
  warnings: Finding[];
  stats: {
    originalWords: number;
    rewriteWords: number;
    lengthRatio: number;
    originalParagraphs: number;
    rewriteParagraphs: number;
  };
}

/* ----------------------------- numbers ----------------------------- */

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
  single: 1, twice: 2, double: 2, half: 0.5, dozen: 12, first: 1, second: 2, third: 3,
};
const SCALE: Record<string, number> = {
  thousand: 1e3, k: 1e3, million: 1e6, m: 1e6, mn: 1e6, billion: 1e9, bn: 1e9, b: 1e9, trillion: 1e12, tn: 1e12,
};

const NUM_RE =
  /([$£€¥₹]\s?)?(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(?:st|nd|rd|th)?(?:\s?(%|per\s?cent\b|percent\b|percentage points?\b|pp\b))?(?:\s?(thousand|million|billion|trillion|bn|mn|tn)\b)?/gi;

export interface NumberToken {
  key: string;
  raw: string;
}

export function extractNumbers(text: string): NumberToken[] {
  const out: NumberToken[] = [];
  // Clock times first, so "3:00" and "3" compare equal and ":30" isn't read as a separate number.
  const t = normaliseQuotes(text).replace(/\b(\d{1,2})(?::(\d{2})(?!\d)|\.(\d{2})(?=\s?[ap]\.?m\b))/gi, (raw, h: string, colon?: string, dot?: string) => {
    const m = (colon ?? dot) as string;
    if (Number(h) > 24 || Number(m) > 59) return raw;
    out.push({ key: m === "00" ? String(Number(h)) : `${Number(h)}:${m}`, raw });
    return " ".repeat(raw.length);
  });
  for (const m of t.matchAll(NUM_RE)) {
    const idx = m.index ?? 0;
    const prev = t[idx - 1];
    // Skip digits glued to letters (e.g. "COVID-19" handled as terminology, "H2O", "v2").
    if (prev && /[\p{L}]/u.test(prev) && !m[1]) continue;
    const currency = (m[1] ?? "").trim();
    const intPart = m[2].replace(/,/g, "");
    const frac = m[3] ?? "";
    let value = parseFloat(intPart + frac);
    const unitRaw = (m[4] ?? "").toLowerCase().replace(/\s+/g, "");
    const unit = unitRaw.startsWith("percentagepoint") || unitRaw === "pp" ? "pp" : unitRaw ? "%" : "";
    const scale = m[5] ? SCALE[m[5].toLowerCase()] ?? 1 : 1;
    value *= scale;
    out.push({ key: `${currency}${formatNum(value)}${unit}`, raw: m[0].trim() });
  }
  return out;
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(6)));
}

function wordNumberKeys(text: string): Set<string> {
  const keys = new Set<string>();
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w in NUMBER_WORDS) {
      let v = NUMBER_WORDS[w];
      const next = words[i + 1];
      if (next && SCALE[next] && next.length > 2) v *= SCALE[next];
      keys.add(formatNum(v));
      keys.add(`${formatNum(v)}%`);
    }
  }
  return keys;
}

function multiset(keys: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
}

/* ----------------------------- quotes & citations ----------------------------- */

export function extractQuotes(text: string): string[] {
  const t = normaliseQuotes(text);
  const out: string[] = [];
  for (const m of t.matchAll(/"([^"\n]{2,600})"/g)) {
    const q = normaliseSpace(m[1]);
    if (q.split(" ").length >= 3) out.push(q);
  }
  // British single-quote quotations: require 4+ words to avoid apostrophes.
  for (const m of t.matchAll(/(?<![\p{L}\p{N}])'([^'\n]{12,600}?)'(?![\p{L}\p{N}])/gu)) {
    const q = normaliseSpace(m[1]);
    if (q.split(" ").length >= 4) out.push(q);
  }
  return out;
}

export interface CitationKey {
  label: string;
  tokens: string[];
}

const YEAR = String.raw`(?:1[5-9]\d{2}|20\d{2})[a-z]?|n\.d\.|in press|forthcoming`;

export function extractCitations(text: string): CitationKey[] {
  const out: CitationKey[] = [];
  const seen = new Set<string>();
  const add = (label: string, tokens: string[]) => {
    const k = tokens.join("|").toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push({ label, tokens });
    }
  };
  // Parenthetical author–year: (Smith, 2020; Lee & Wong, 2019a, p. 4)
  for (const m of text.matchAll(/\(([^()]{3,300})\)/g)) {
    const inner = m[1];
    if (!new RegExp(YEAR).test(inner)) continue;
    for (const part of inner.split(";")) {
      const year = part.match(new RegExp(YEAR))?.[0];
      const surname = part.match(/\b([\p{Lu}][\p{L}'’\-]+)/u)?.[1];
      if (year && surname && !/^(see|cf|e\.g|i\.e|pp?)$/i.test(surname)) {
        add(`${surname} (${year})`, [surname, year]);
      }
    }
  }
  // Narrative citations: Smith (2020), Smith et al. (2020), Smith and Lee (2019)
  for (const m of text.matchAll(
    new RegExp(String.raw`\b([\p{Lu}][\p{L}'’\-]+)(?:\s+et al\.?|\s+(?:and|&)\s+[\p{Lu}][\p{L}'’\-]+)?\s*\((${YEAR})`, "gu"),
  )) {
    add(`${m[1]} (${m[2]})`, [m[1], m[2]]);
  }
  // Numeric citations: [12], [3, 5], [1–4]
  for (const m of text.matchAll(/\[(\d+(?:\s*[,–\-]\s*\d+)*)\]/g)) {
    const label = `[${m[1].replace(/\s+/g, "")}]`;
    add(label, [label]);
  }
  return out;
}

function containsCitation(rewrite: string, c: CitationKey): boolean {
  if (c.tokens.length === 1) {
    return rewrite.replace(/\s+/g, "").includes(c.tokens[0]);
  }
  const lower = rewrite.toLowerCase();
  return c.tokens.every((t) => lower.includes(t.toLowerCase()));
}

export function extractUrls(text: string): string[] {
  return [...text.matchAll(/\b(?:https?:\/\/|www\.)[^\s<>()"']+[^\s<>()"'.,;:!?]|[\w.+-]+@[\w-]+\.[\w.]+\w/g)].map(
    (m) => m[0],
  );
}

/* ----------------------------- terminology & entities ----------------------------- */

const COMMON_CAPS = new Set([
  "I", "A", "OK", "AI", "US", "UK", "EU", "UN", "TV", "PM", "AM", "CEO", "FAQ", "PS", "NB", "OR", "AND",
]);

export function extractTechnicalTerms(text: string): string[] {
  const terms = new Set<string>();
  for (const m of text.matchAll(/\b(?:[A-Z]{2,}[A-Za-z0-9]*(?:-\d+)?s?|[a-z]+[A-Z][A-Za-z0-9]+|[A-Za-z]+\d+[A-Za-z0-9]*|[A-Za-z]+-\d+)\b/g)) {
    const t = m[0].replace(/s$/, (s) => (m[0].length > 3 && /[A-Z]s$/.test(m[0]) ? "" : s));
    if (!COMMON_CAPS.has(t) && t.length <= 40) terms.add(t);
  }
  return [...terms];
}

const ENTITY_STOP = new Set([
  "The", "A", "An", "This", "That", "These", "Those", "It", "In", "On", "At", "For", "But", "And", "Or", "If",
  "When", "While", "However", "Moreover", "Furthermore", "Additionally", "Although", "Because", "As", "We",
  "Our", "They", "Their", "He", "She", "His", "Her", "You", "Your", "My", "To", "Of", "By", "With", "From",
  "Overall", "Finally", "First", "Second", "Third", "Dear", "Hi", "Hello", "Thanks", "Best", "Regards",
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "I",
]);

/** Multi-word or mid-sentence capitalised names ("World Health Organization", "Lisbon"). */
export function extractEntities(text: string): string[] {
  const out = new Set<string>();
  const re = /(?<=[a-z,;:]\s|\(|\s[a-z]+\s)([A-Z][a-z’'\-]+(?:\s+(?:of|the|and|for|de|van|von)?\s*[A-Z][a-z’'\-]+)*)/g;
  for (const m of text.matchAll(re)) {
    const e = m[1].trim();
    if (!ENTITY_STOP.has(e) && e.length > 2) out.add(e);
  }
  return [...out];
}

/* ----------------------------- certainty, negation, conditions ----------------------------- */

const HEDGES = [
  "may", "might", "could", "possibly", "perhaps", "likely", "unlikely", "probably", "suggest", "suggests",
  "suggested", "appear", "appears", "appeared", "seem", "seems", "seemed", "potentially", "tend", "tends",
  "often", "sometimes", "some", "many", "most", "approximately", "roughly", "partly", "partially",
  "generally", "typically", "usually", "somewhat", "relatively", "arguably", "indicate", "indicates",
];
const ABSOLUTES = [
  "will", "always", "never", "all", "every", "everyone", "definitely", "certainly", "clearly",
  "undoubtedly", "prove", "proves", "proved", "proven", "guarantee", "guarantees", "guaranteed", "must",
  "impossible", "entirely", "completely", "universally", "inevitably", "only",
];
const NEGATORS = /\b(not|no|never|none|nobody|nothing|neither|nor|without|cannot|can't|won't|don't|doesn't|didn't|isn't|aren't|wasn't|weren't|shouldn't|wouldn't|couldn't|hasn't|haven't|hadn't|mustn't|lack|lacks|lacked|fail|fails|failed)\b|n't\b/gi;
const CONDITIONALS = /\b(if|unless|provided that|providing that|assuming|as long as|only when|on condition that|in the event that|whether)\b/gi;

function wordCounts(text: string, vocab: string[]): Map<string, number> {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  const set = new Set(vocab);
  const m = new Map<string, number>();
  for (const w of words) if (set.has(w)) m.set(w, (m.get(w) ?? 0) + 1);
  return m;
}

function countMatches(text: string, re: RegExp): number {
  return (normaliseQuotes(text).match(re) ?? []).length;
}

/* ----------------------------- main ----------------------------- */

export function checkFidelity(original: string, rewrite: string, settings: Settings): DeterministicReport {
  const findings: Finding[] = [];
  const sameLanguage = settings.language === "original";
  const o = normaliseQuotes(original);
  const r = normaliseQuotes(rewrite);

  // Numbers: every number in the source must survive (word forms in the rewrite count).
  const oNums = extractNumbers(o);
  const rNums = extractNumbers(r);
  const rCounts = multiset(rNums.map((n) => n.key));
  const rWordKeys = wordNumberKeys(r);
  const oWordKeys = wordNumberKeys(o);
  const missing: string[] = [];
  for (const n of oNums) {
    const c = rCounts.get(n.key) ?? 0;
    if (c > 0) rCounts.set(n.key, c - 1);
    else if (!rWordKeys.has(n.key) && !missing.includes(n.raw)) missing.push(n.raw);
  }
  // Translating may legitimately change number formatting (3.5 → 3,5), so only warn then.
  const numberSeverity = sameLanguage ? "hard" : "warn";
  if (missing.length) {
    findings.push({
      category: "number",
      severity: numberSeverity,
      message: `Number(s) from the original are missing or changed: ${missing.map((x) => `"${x}"`).join(", ")}.`,
    });
  }
  const oCounts = multiset(oNums.map((n) => n.key));
  const added = rNums.filter((n) => !oCounts.has(n.key) && !oWordKeys.has(n.key)).map((n) => n.raw);
  if (added.length) {
    findings.push({
      category: "number",
      severity: numberSeverity,
      message: `New number(s) not in the original: ${[...new Set(added)].map((x) => `"${x}"`).join(", ")}.`,
    });
  }

  // Quotations must stay verbatim (unless translating).
  if (sameLanguage) {
    const rFlat = normaliseSpace(r);
    const altered = extractQuotes(o).filter((q) => !rFlat.includes(q));
    if (altered.length) {
      findings.push({
        category: "quote",
        severity: "hard",
        message: `Quoted text was altered or removed: ${altered.map((q) => `"${truncate(q, 80)}"`).join("; ")}.`,
      });
    }
  }

  // Citations.
  const lostCitations = extractCitations(o).filter((c) => !containsCitation(r, c));
  if (lostCitations.length) {
    findings.push({
      category: "citation",
      severity: "hard",
      message: `Citation(s) missing: ${lostCitations.map((c) => c.label).join(", ")}.`,
    });
  }

  // URLs and emails.
  const lostUrls = extractUrls(o).filter((u) => !r.includes(u));
  if (lostUrls.length) {
    findings.push({ category: "url", severity: "hard", message: `Link(s) or email(s) changed: ${lostUrls.join(", ")}.` });
  }

  // User-protected phrases.
  const rLowerFlat = normaliseSpace(r).toLowerCase();
  const lostProtected = settings.protectedPhrases.filter(
    (p) => o.toLowerCase().includes(normaliseQuotes(p).toLowerCase()) && !rLowerFlat.includes(normaliseSpace(normaliseQuotes(p)).toLowerCase()),
  );
  if (lostProtected.length) {
    findings.push({
      category: "protected",
      severity: "hard",
      message: `Protected phrase(s) were changed: ${lostProtected.map((p) => `"${p}"`).join(", ")}.`,
    });
  }

  // Technical terms (acronyms, alphanumerics).
  if (settings.preserveTerminology) {
    const lostTerms = extractTechnicalTerms(o).filter((t) => !new RegExp(`\\b${escapeRe(t)}`, "i").test(r));
    if (lostTerms.length) {
      findings.push({
        category: "terminology",
        severity: "warn",
        message: `Technical term(s) no longer present: ${lostTerms.join(", ")}.`,
      });
    }
  }

  // Named entities.
  const lostEntities = extractEntities(o).filter((e) => !r.toLowerCase().includes(e.toLowerCase()));
  if (lostEntities.length && sameLanguage) {
    findings.push({
      category: "entity",
      severity: "warn",
      message: `Name(s) no longer appear verbatim: ${lostEntities.slice(0, 8).join(", ")}.`,
    });
  }

  if (sameLanguage) {
    // Certainty: new absolutes, or hedges that disappeared.
    const oAbs = wordCounts(o, ABSOLUTES);
    const rAbs = wordCounts(r, ABSOLUTES);
    const newAbs = [...rAbs.entries()].filter(([w, c]) => c > (oAbs.get(w) ?? 0)).map(([w]) => w);
    const oHedge = wordCounts(o, HEDGES);
    const rHedge = wordCounts(r, HEDGES);
    const oHedgeTotal = sum(oHedge);
    const rHedgeTotal = sum(rHedge);
    const lostHedges = [...oHedge.entries()].filter(([w, c]) => c > (rHedge.get(w) ?? 0)).map(([w]) => w);
    if (newAbs.length) {
      findings.push({
        category: "certainty",
        severity: "warn",
        message: `Stronger/absolute wording appears more often in the rewrite: ${newAbs.map((w) => `"${w}"`).join(", ")}. Check certainty was not increased.`,
      });
    }
    if (rHedgeTotal < oHedgeTotal && lostHedges.length) {
      findings.push({
        category: "certainty",
        severity: "warn",
        message: `Hedging words dropped (${oHedgeTotal} → ${rHedgeTotal}): ${lostHedges.map((w) => `"${w}"`).join(", ")}. Check the degree of certainty is unchanged.`,
      });
    }

    // Correlation → causation: more causal language than the source, where the source talks about association.
    const CAUSAL = /\b(caus(e|es|ed|ing|al|ally|ation)|leads? to|led to|results? in|resulted in|drives?|drove|triggers?|triggered)\b/gi;
    const oCorrelational = /\b(correlat\w*|associat\w*|linked|link between|relationship between)\b/i.test(o);
    if (oCorrelational && countMatches(r, CAUSAL) > countMatches(o, CAUSAL)) {
      findings.push({
        category: "causation",
        severity: "warn",
        message: "The original describes an association, but the rewrite uses causal language. Check correlation was not turned into causation.",
      });
    }

    // Negation and conditionals.
    const oNeg = countMatches(o, NEGATORS);
    const rNeg = countMatches(r, NEGATORS);
    if (oNeg !== rNeg) {
      findings.push({
        category: "negation",
        severity: "warn",
        message: `Number of negations changed (${oNeg} → ${rNeg}). Check no statement flipped polarity.`,
      });
    }
    const oCond = countMatches(o, CONDITIONALS);
    const rCond = countMatches(r, CONDITIONALS);
    if (rCond < oCond) {
      findings.push({
        category: "condition",
        severity: "warn",
        message: `Fewer conditional markers (if/unless/provided…) in the rewrite (${oCond} → ${rCond}). Check conditions were kept.`,
      });
    }
  }

  // Structure and length.
  const oParas = splitParagraphs(original).length;
  const rParas = splitParagraphs(rewrite).length;
  if (settings.preserveParagraphs && oParas !== rParas) {
    findings.push({
      category: "structure",
      severity: "hard",
      message: `Paragraph count changed (${oParas} → ${rParas}) although paragraph structure should be preserved.`,
    });
  }
  const oWords = countWords(original);
  const rWords = countWords(rewrite);
  const ratio = oWords ? rWords / oWords : 1;
  const lengthMsg = lengthCheck(settings, oWords, rWords, ratio);
  if (lengthMsg) findings.push({ category: "length", severity: "warn", message: lengthMsg });

  return {
    findings,
    hard: findings.filter((f) => f.severity === "hard"),
    warnings: findings.filter((f) => f.severity === "warn"),
    stats: { originalWords: oWords, rewriteWords: rWords, lengthRatio: ratio, originalParagraphs: oParas, rewriteParagraphs: rParas },
  };
}

function lengthCheck(s: Settings, o: number, r: number, ratio: number): string | null {
  if (o < 25) return null;
  switch (s.lengthMode) {
    case "same":
      if (ratio < 0.75 || ratio > 1.3) return `Length changed noticeably (${o} → ${r} words) although similar length was requested.`;
      return null;
    case "shorter":
      if (ratio > 0.97) return `Rewrite is not shorter (${o} → ${r} words).`;
      return null;
    case "longer":
      if (ratio < 1.03) return `Rewrite is not longer (${o} → ${r} words).`;
      return null;
    case "target":
      if (s.targetWords && Math.abs(r - s.targetWords) / s.targetWords > 0.15)
        return `Rewrite is ${r} words; target was ~${s.targetWords}.`;
      return null;
  }
}

function sum(m: Map<string, number>): number {
  let t = 0;
  for (const v of m.values()) t += v;
  return t;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
