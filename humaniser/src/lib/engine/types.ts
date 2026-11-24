import type { StyleMetrics } from "./style";

export type Stage = "rewriting" | "verifying" | "refining";

export type PipelineEvent =
  | { type: "stage"; stage: Stage; pass?: number }
  | { type: "delta"; text: string }
  | { type: "result"; result: HumaniseResult }
  | { type: "error"; code: string; message: string };

export interface ReportIssue {
  severity: "critical" | "major" | "minor";
  category: string;
  message: string;
  originalExcerpt?: string;
  revisedExcerpt?: string;
  source: "automated" | "reviewer";
}

export interface HumaniseResult {
  text: string;
  report: {
    status: "verified" | "issues" | "unverified";
    summary: string;
    keyPoints: { point: string; status: "retained" | "weakened" | "altered" | "missing" }[];
    issues: ReportIssue[];
    naturalness: number | null;
    toneAdherence: "good" | "partial" | "poor" | null;
    automatedChecks: { hard: string[]; warnings: string[] };
    correctionPasses: number;
  };
  metrics: { before: StyleMetrics; after: StyleMetrics };
  meta: { model: string; mock: boolean; ms: number; correctionPasses: number };
}

export interface SentenceResult {
  options: { text: string; approach: string; warnings: string[] }[];
}
