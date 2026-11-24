/**
 * Lightweight stylistic analysis.
 *
 * These signals are deliberately limited to features with published evidence of
 * differing between instruction-tuned LLM output and human writing:
 *  - present-participial clauses (", highlighting …") — Reinhart et al., PNAS 2025
 *  - nominalisation density — Reinhart et al., PNAS 2025
 *  - "excess vocabulary" (delve, showcase, underscore, …) — Kobak et al. 2024;
 *    Liang et al. 2024 (peer-review adjectives)
 * plus classic editing heuristics (repeated sentence openers, stacked
 * transitions, formulaic phrases, uniform sentence length) that style guides
 * have flagged long before LLMs. None of these is "bad" in itself; they are
 * hints for the rewriter and a before/after view for the user. They are NOT an
 * AI-detection score and should never be presented as one.
 */
import { countWords, sentenceTexts } from "./text";

export const STOCK_WORDS = [
  "delve", "delves", "delving", "tapestry", "testament", "underscore", "underscores", "underscoring",
  "showcase", "showcases", "showcasing", "pivotal", "intricate", "intricacies", "meticulous", "meticulously",
  "commendable", "realm", "multifaceted", "seamless", "seamlessly", "holistic", "foster", "fostering",
  "leverage", "leveraging", "harness", "harnessing", "embark", "unlock", "unlocking", "elevate",
  "paramount", "noteworthy", "invaluable", "bolster", "bolstering", "navigate", "navigating", "landscape",
  "ever-evolving", "groundbreaking", "transformative", "synergy", "endeavor", "endeavour", "utilize",
  "utilise", "utilization", "utilisation", "furthermore", "moreover", "additionally", "crucial", "vibrant",
  "nuanced", "profound", "resonate", "resonates", "garner", "garnered", "streamline", "empower", "empowering",
];

export const FORMULAIC_PHRASES = [
  "it is important to note",
  "it's important to note",
  "it is worth noting",
  "it's worth noting",
  "in today's fast-paced",
  "in today's world",
  "in today's digital",
  "in the ever-evolving",
  "plays a crucial role",
  "plays a pivotal role",
  "plays a vital role",
  "a wide range of",
  "a myriad of",
  "a plethora of",
  "in conclusion",
  "in summary",
  "to sum up",
  "when it comes to",
  "at the end of the day",
  "not only",
  "serves as a",
  "stands as a",
  "the realm of",
  "navigate the complexities",
  "rich tapestry",
  "a testament to",
  "in order to",
  "due to the fact that",
  "it can be argued that",
  "one of the most",
  "first and foremost",
  "last but not least",
  "i hope this email finds you well",
  "i hope this message finds you well",
  "please do not hesitate",
  "feel free to",
];

const TRANSITIONS = [
  "however", "moreover", "furthermore", "additionally", "consequently", "therefore", "thus", "hence",
  "nevertheless", "nonetheless", "overall", "ultimately", "importantly", "notably", "indeed", "accordingly",
  "subsequently", "likewise", "similarly", "conversely", "meanwhile", "finally", "firstly", "secondly",
];

export interface StyleMetrics {
  words: number;
  sentences: number;
  avgSentenceLength: number;
  /** Coefficient of variation of sentence length (0 = perfectly uniform). */
  sentenceLengthVariation: number;
  stockWordHits: { word: string; count: number }[];
  formulaicHits: { phrase: string; count: number }[];
  /** Sentences beginning with a stock transition word, as a fraction of all sentences. */
  transitionOpenerRate: number;
  /** Most repeated sentence opener (first word) and how many times it starts a sentence. */
  repeatedOpeners: { opener: string; count: number }[];
  participialTails: number;
  nominalisationsPer100: number;
  passiveEstimate: number;
  emDashes: number;
}

export function analyseStyle(text: string): StyleMetrics {
  const sentences = sentenceTexts(text);
  const lengths = sentences.map(countWords).filter((n) => n > 0);
  const words = countWords(text);
  const mean = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const sd = lengths.length
    ? Math.sqrt(lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length)
    : 0;
  const lower = text.toLowerCase().replace(/[’]/g, "'");
  const tokens = lower.match(/[a-z][a-z'-]*/g) ?? [];

  const stock = new Map<string, number>();
  const stockSet = new Set(STOCK_WORDS);
  for (const t of tokens) if (stockSet.has(t)) stock.set(t, (stock.get(t) ?? 0) + 1);

  const formulaic = FORMULAIC_PHRASES.map((p) => ({ phrase: p, count: countOccurrences(lower, p) })).filter(
    (x) => x.count > 0,
  );

  const openers = new Map<string, number>();
  let transitionOpeners = 0;
  for (const s of sentences) {
    const first = s.replace(/^[^\p{L}]+/u, "").split(/[\s,]+/)[0]?.toLowerCase() ?? "";
    if (!first) continue;
    openers.set(first, (openers.get(first) ?? 0) + 1);
    if (TRANSITIONS.includes(first)) transitionOpeners++;
  }
  const repeatedOpeners = [...openers.entries()]
    .filter(([w, c]) => c >= 3 && c / Math.max(1, sentences.length) >= 0.2 && !["i"].includes(w))
    .map(([opener, count]) => ({ opener, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const participialTails = (text.match(/,\s+(?:thereby\s+|thus\s+)?[a-z]+ing\b(?!\s+(?:to|that)\b)/g) ?? []).filter(
    (m) => !/,\s+(?:during|including|according|regarding|concerning|considering|following|nothing|something|anything|everything|morning|evening|thing|king|spring|string|bring)\b/.test(m),
  ).length;

  const nominalisations = tokens.filter(
    (t) => t.length > 6 && /(tion|tions|ment|ments|ness|ity|ities|ance|ence|isation|ization)$/.test(t),
  ).length;

  const passiveEstimate = (lower.match(/\b(is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?\w+(ed|en)\b/g) ?? []).length;

  return {
    words,
    sentences: sentences.length,
    avgSentenceLength: round(mean),
    sentenceLengthVariation: mean ? round(sd / mean) : 0,
    stockWordHits: [...stock.entries()].map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count),
    formulaicHits: formulaic,
    transitionOpenerRate: sentences.length ? round(transitionOpeners / sentences.length) : 0,
    repeatedOpeners,
    participialTails,
    nominalisationsPer100: words ? round((nominalisations / words) * 100) : 0,
    passiveEstimate,
    emDashes: (text.match(/—|\s--\s|\s–\s/g) ?? []).length,
  };
}

/** Human-readable observations to give the rewriter as hints (not commands). */
export function styleObservations(m: StyleMetrics): string[] {
  const obs: string[] = [];
  if (m.sentences >= 4 && m.sentenceLengthVariation < 0.25)
    obs.push(`Sentence lengths are very uniform (avg ${m.avgSentenceLength} words, low variation); the rhythm may feel monotonous.`);
  if (m.avgSentenceLength > 30) obs.push(`Sentences are long on average (${m.avgSentenceLength} words); some may be hard to follow.`);
  if (m.repeatedOpeners.length)
    obs.push(`Repeated sentence openers: ${m.repeatedOpeners.map((o) => `"${o.opener}" ×${o.count}`).join(", ")}.`);
  if (m.transitionOpenerRate >= 0.3 && m.sentences >= 3)
    obs.push(`${Math.round(m.transitionOpenerRate * 100)}% of sentences open with a transition word; many may be unnecessary.`);
  if (m.stockWordHits.length)
    obs.push(`Stock/overused vocabulary present: ${m.stockWordHits.slice(0, 10).map((h) => h.word).join(", ")} (keep only where it is the precise or technical word).`);
  if (m.formulaicHits.length)
    obs.push(`Formulaic phrases: ${m.formulaicHits.map((h) => `"${h.phrase}"`).join(", ")}.`);
  if (m.words > 0 && m.participialTails / Math.max(1, m.sentences) >= 0.25)
    obs.push(`Frequent trailing participial clauses (", highlighting…", ", ensuring…"): ${m.participialTails}.`);
  if (m.nominalisationsPer100 >= 6)
    obs.push(`High nominalisation density (${m.nominalisationsPer100} per 100 words); verbs may read more naturally in places.`);
  if (m.emDashes >= 3 && m.emDashes / Math.max(1, m.sentences) > 0.2) obs.push(`Heavy dash use (${m.emDashes}).`);
  return obs;
}

function countOccurrences(hay: string, needle: string): number {
  let i = 0;
  let c = 0;
  while ((i = hay.indexOf(needle, i)) !== -1) {
    c++;
    i += needle.length;
  }
  return c;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
