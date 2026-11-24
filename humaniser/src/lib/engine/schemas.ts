import { z } from "zod";

export const ISSUE_CATEGORIES = [
  "omission",
  "addition",
  "meaning_change",
  "certainty_shift",
  "negation",
  "number_or_fact",
  "terminology",
  "quote_or_citation",
  "protected_phrase",
  "tone",
  "length",
  "structure",
  "grammar",
  "unnatural_phrasing",
  "over_editing",
] as const;

export const VerificationSchema = z.object({
  key_points: z
    .array(
      z.object({
        point: z.string(),
        status: z.enum(["retained", "weakened", "altered", "missing"]),
      }),
    )
    .describe("Central ideas of the original and whether each survived in the revision."),
  issues: z.array(
    z.object({
      severity: z.enum(["critical", "major", "minor"]),
      category: z.enum(ISSUE_CATEGORIES),
      original_excerpt: z.string(),
      revised_excerpt: z.string(),
      explanation: z.string(),
      suggested_fix: z.string(),
    }),
  ),
  tone_adherence: z.enum(["good", "partial", "poor"]),
  naturalness: z.number().int().min(1).max(5).describe("1 = stilted/mechanical, 5 = reads like skilled human writing."),
  summary: z.string().describe("One short sentence summarising the fidelity of the revision for the end user."),
});
export type Verification = z.infer<typeof VerificationSchema>;

export const SentenceOptionsSchema = z.object({
  options: z
    .array(
      z.object({
        text: z.string(),
        approach: z.string().describe("2–5 word label, e.g. 'Tighter', 'Restructured', 'Smoother link'."),
      }),
    )
    .min(1)
    .max(3),
});
export type SentenceOptions = z.infer<typeof SentenceOptionsSchema>;
