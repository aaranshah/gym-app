/** Small, dependency-free text helpers shared by client and server. */

export function countWords(text: string): number {
  const m = text.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’\-.]*/gu);
  return m ? m.length : 0;
}

export function countChars(text: string): number {
  return [...text].length;
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const ABBREVIATIONS = [
  "e.g", "i.e", "etc", "vs", "cf", "al", "Dr", "Mr", "Mrs", "Ms", "Prof", "Sr", "Jr", "St",
  "Fig", "fig", "No", "no", "Vol", "vol", "pp", "p", "ed", "eds", "approx", "Inc", "Ltd", "Co",
  "U.S", "U.K", "Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug", "Sep", "Sept", "Oct", "Nov", "Dec",
];

/**
 * Split text into sentence spans with offsets. Conservative: avoids splitting on
 * common abbreviations, decimals, initials and citation patterns like "et al.".
 * Whitespace between sentences is attached to the preceding span, so joining
 * all span texts reproduces the input exactly.
 */
export function splitSentences(text: string): { text: string; start: number; end: number }[] {
  const spans: { text: string; start: number; end: number }[] = [];
  let start = 0;
  const re = /([.!?…]+["'”’)\]]*)(\s+)|(\n\s*\n)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const boundaryEnd = m.index + m[0].length;
    if (m[3] === undefined) {
      const before = text.slice(start, m.index);
      const lastToken = before.split(/\s/).pop() ?? "";
      const next = text.slice(boundaryEnd, boundaryEnd + 1);
      const isAbbrev = ABBREVIATIONS.some((a) => lastToken.replace(/^[("'“‘]/, "") === a);
      const isInitial = /^[A-Z]$/.test(lastToken);
      const nextLower = /[a-z0-9]/.test(next);
      if ((isAbbrev || isInitial) && m[1] === "." ) continue;
      if (nextLower && m[1] === ".") continue;
    }
    spans.push({ text: text.slice(start, boundaryEnd), start, end: boundaryEnd });
    start = boundaryEnd;
  }
  if (start < text.length) spans.push({ text: text.slice(start), start, end: text.length });
  return spans.filter((s) => s.text.length > 0);
}

export function sentenceTexts(text: string): string[] {
  return splitSentences(text)
    .map((s) => s.text.trim())
    .filter((s) => /[\p{L}\p{N}]/u.test(s));
}

export function normaliseQuotes(s: string): string {
  return s.replace(/[“”„‟″]/g, '"').replace(/[‘’‚‛′]/g, "'");
}

export function normaliseSpace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function escapeForTag(s: string, tag: string): string {
  // Prevent user text from closing or opening the delimiter tags we wrap it in.
  const re = new RegExp(`<\\s*/?\\s*${tag}\\b[^>]*>`, "gi");
  return s.replace(re, (t) => t.replace(/</g, "‹").replace(/>/g, "›"));
}
