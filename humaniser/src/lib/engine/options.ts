import { z } from "zod";

/**
 * Shared settings model. Imported by both the client (to render controls)
 * and the server (to validate requests and build prompts), so the two can
 * never drift apart.
 */

export const INTENSITIES = ["light", "balanced", "deep"] as const;
export type Intensity = (typeof INTENSITIES)[number];

export const INTENSITY_META: Record<Intensity, { label: string; hint: string }> = {
  light: { label: "Light", hint: "Keep your wording; fix only what reads awkwardly." },
  balanced: { label: "Balanced", hint: "Improve flow, rhythm and phrasing with restraint." },
  deep: { label: "Deep", hint: "Restructure sentences freely; keep every idea." },
};

export const TONES = [
  "original",
  "natural",
  "conversational",
  "academic",
  "formal",
  "professional",
  "casual",
  "analytical",
  "persuasive",
  "concise",
  "sophisticated",
  "clear",
] as const;
export type Tone = (typeof TONES)[number];

export const TONE_META: Record<Tone, { label: string; guidance: string }> = {
  original: {
    label: "Keep original tone",
    guidance:
      "Match the source's existing register, formality and voice exactly. Only remove what makes it read as mechanical or stilted.",
  },
  natural: {
    label: "Natural",
    guidance:
      "Plain, fluent prose a thoughtful person would write. Neutral formality; neither stiff nor chatty.",
  },
  conversational: {
    label: "Conversational",
    guidance:
      "Sounds like a knowledgeable person talking to the reader directly. Second person and contractions are fine where they fit; keep it substantive, not breezy.",
  },
  academic: {
    label: "Academic",
    guidance:
      "Scholarly register: precise terminology, calibrated hedging, explicit logical connections, third person, no contractions or colloquialisms. Clarity beats ornament; avoid inflated vocabulary.",
  },
  formal: {
    label: "Formal",
    guidance:
      "Polished and correct; no contractions, slang or casual asides. Courteous and measured, without sounding bureaucratic.",
  },
  professional: {
    label: "Professional",
    guidance:
      "Workplace register: direct, confident, courteous. Lead with what matters; cut corporate filler and buzzwords.",
  },
  casual: {
    label: "Casual",
    guidance:
      "Relaxed and friendly, like a message to a colleague you know well. Contractions welcome; no forced slang.",
  },
  analytical: {
    label: "Analytical",
    guidance:
      "Logical and evidence-focused. Make reasoning steps, comparisons and causal links explicit; prefer precise, measured statements.",
  },
  persuasive: {
    label: "Persuasive",
    guidance:
      "Make the argument land: strong topic sentences, purposeful emphasis, confident verbs. Do NOT add claims, evidence or exaggerate certainty beyond the source.",
  },
  concise: {
    label: "Concise",
    guidance:
      "Remove redundancy and filler; prefer short, direct constructions. Every idea must survive — concision means fewer words, not less content.",
  },
  sophisticated: {
    label: "Sophisticated",
    guidance:
      "Elegant, varied syntax and a precise, rich vocabulary — the style of a skilled essayist. Never obscure the meaning or reach for ornamental words.",
  },
  clear: {
    label: "Clear and straightforward",
    guidance:
      "Plain-language style: short sentences, common words, one idea per sentence, jargon explained or replaced unless it must be preserved.",
  },
};

export const ENGLISH_VARIANTS = ["auto", "british", "american"] as const;
export type EnglishVariant = (typeof ENGLISH_VARIANTS)[number];
export const ENGLISH_VARIANT_META: Record<EnglishVariant, string> = {
  auto: "Match source",
  british: "British English",
  american: "American English",
};

export const LENGTH_MODES = ["same", "shorter", "longer", "target"] as const;
export type LengthMode = (typeof LENGTH_MODES)[number];
export const LENGTH_META: Record<LengthMode, string> = {
  same: "About the same",
  shorter: "Shorter",
  longer: "Longer",
  target: "Target word count",
};

export const LANGUAGES = [
  "original",
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
] as const;
export type Language = (typeof LANGUAGES)[number];

export const LIMITS = {
  maxChars: 20_000,
  minChars: 20,
  maxCustomInstructions: 600,
  maxProtectedPhrases: 40,
  maxProtectedPhraseLength: 120,
  maxSentenceChars: 1_200,
  maxContextChars: 4_000,
  maxPreviousVersions: 3,
  maxFileBytes: 2 * 1024 * 1024,
} as const;

export const SettingsSchema = z.object({
  intensity: z.enum(INTENSITIES).default("balanced"),
  tone: z.enum(TONES).default("original"),
  englishVariant: z.enum(ENGLISH_VARIANTS).default("auto"),
  language: z.enum(LANGUAGES).default("original"),
  lengthMode: z.enum(LENGTH_MODES).default("same"),
  targetWords: z.number().int().min(10).max(5000).optional(),
  preserveParagraphs: z.boolean().default(true),
  preserveTerminology: z.boolean().default(true),
  customInstructions: z.string().trim().max(LIMITS.maxCustomInstructions).default(""),
  protectedPhrases: z
    .array(z.string().trim().min(1).max(LIMITS.maxProtectedPhraseLength))
    .max(LIMITS.maxProtectedPhrases)
    .default([]),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SETTINGS: Settings = SettingsSchema.parse({});

export const HumaniseRequestSchema = z.object({
  text: z
    .string()
    .min(1, "Please enter some text to humanise.")
    .max(LIMITS.maxChars, `Text is too long (max ${LIMITS.maxChars.toLocaleString()} characters).`),
  settings: SettingsSchema.default(DEFAULT_SETTINGS),
  /** Earlier outputs for the same input; when present, produce a distinct alternative. */
  previousVersions: z.array(z.string().max(LIMITS.maxChars * 2)).max(LIMITS.maxPreviousVersions).default([]),
});
export type HumaniseRequest = z.infer<typeof HumaniseRequestSchema>;

export const SentenceRequestSchema = z.object({
  sentence: z.string().trim().min(2).max(LIMITS.maxSentenceChars),
  context: z.string().max(LIMITS.maxContextChars).default(""),
  /** The original (pre-humanisation) text, used to protect meaning. */
  sourceText: z.string().max(LIMITS.maxChars).default(""),
  instruction: z.string().trim().max(300).default(""),
  settings: SettingsSchema.default(DEFAULT_SETTINGS),
});
export type SentenceRequest = z.infer<typeof SentenceRequestSchema>;
