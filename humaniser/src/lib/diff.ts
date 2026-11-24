import { diffWordsWithSpace } from "diff";

export type DiffSegment =
  | { kind: "equal"; text: string }
  | { kind: "change"; removed: string; added: string };

/**
 * Word-level diff (Myers algorithm via jsdiff) with a semantic clean-up pass.
 *
 * A raw word diff of a restructured sentence is unreadable confetti: tiny
 * "equal" islands like "the" or "of" between large edits. Like
 * diff-match-patch's semantic clean-up, we absorb short equal runs that sit
 * between two edits into the surrounding change, then coalesce adjacent edits.
 * The result shows a restructured phrase as one "was → now" block while
 * untouched text stays plain.
 */
export function diffText(original: string, revised: string, opts: { absorbWords?: number } = {}): DiffSegment[] {
  const absorb = opts.absorbWords ?? 2;
  const parts = diffWordsWithSpace(original, revised);

  type Raw = { kind: "equal" | "removed" | "added"; text: string };
  const raw: Raw[] = parts.map((p) => ({ kind: p.added ? "added" : p.removed ? "removed" : "equal", text: p.value }));

  // Absorb short equal islands between changes.
  const absorbed: Raw[] = [];
  for (let i = 0; i < raw.length; i++) {
    const p = raw[i];
    const prevChange = i > 0 && raw[i - 1].kind !== "equal";
    const nextChange = i < raw.length - 1 && raw[i + 1].kind !== "equal";
    if (
      p.kind === "equal" &&
      prevChange &&
      nextChange &&
      wordCount(p.text) <= absorb &&
      !/\n/.test(p.text)
    ) {
      absorbed.push({ kind: "removed", text: p.text }, { kind: "added", text: p.text });
    } else {
      absorbed.push(p);
    }
  }

  // Coalesce runs of removed/added into single change segments.
  const out: DiffSegment[] = [];
  let removed = "";
  let added = "";
  const flush = () => {
    if (removed || added) out.push({ kind: "change", removed, added });
    removed = "";
    added = "";
  };
  for (const p of absorbed) {
    if (p.kind === "equal") {
      flush();
      const last = out[out.length - 1];
      if (last?.kind === "equal") last.text += p.text;
      else out.push({ kind: "equal", text: p.text });
    } else if (p.kind === "removed") removed += p.text;
    else added += p.text;
  }
  flush();
  return out.flatMap(splitSharedWhitespace);
}

/** Move whitespace shared at the edges of a change out into equal text so highlights hug the words. */
function splitSharedWhitespace(s: DiffSegment): DiffSegment[] {
  if (s.kind !== "change") return [s];
  const lead = commonPrefixWs(s.removed, s.added);
  const trail = commonSuffixWs(s.removed.slice(lead.length), s.added.slice(lead.length));
  const removed = s.removed.slice(lead.length, s.removed.length - trail.length);
  const added = s.added.slice(lead.length, s.added.length - trail.length);
  const res: DiffSegment[] = [];
  if (lead) res.push({ kind: "equal", text: lead });
  if (removed || added) res.push({ kind: "change", removed, added });
  if (trail) res.push({ kind: "equal", text: trail });
  return res;
}

function commonPrefixWs(a: string, b: string): string {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i] && /\s/.test(a[i])) i++;
  return a.slice(0, i);
}
function commonSuffixWs(a: string, b: string): string {
  let i = 0;
  while (i < a.length && i < b.length && a[a.length - 1 - i] === b[b.length - 1 - i] && /\s/.test(a[a.length - 1 - i])) i++;
  return i ? a.slice(a.length - i) : "";
}

function wordCount(s: string): number {
  return (s.match(/\S+/g) ?? []).length;
}

/** Share of the revised text's words that are new or changed (0–1). */
export function changeRatio(segments: DiffSegment[]): number {
  let changed = 0;
  let total = 0;
  for (const s of segments) {
    if (s.kind === "equal") total += wordCount(s.text);
    else {
      const n = wordCount(s.added);
      changed += n;
      total += n;
    }
  }
  return total ? changed / total : 0;
}

/** Rebuild either side from segments (used to verify diffs are lossless). */
export function reconstruct(segments: DiffSegment[], side: "original" | "revised"): string {
  return segments.map((s) => (s.kind === "equal" ? s.text : side === "original" ? s.removed : s.added)).join("");
}
