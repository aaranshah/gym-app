import type { Settings } from "./engine/options";
import type { HumaniseResult } from "./engine/types";

export type VersionKind = "humanise" | "alternative" | "again" | "sentence";

export interface Version {
  id: string;
  text: string;
  kind: VersionKind;
  /** Full pipeline result (absent for local sentence edits). */
  result?: HumaniseResult;
  settings: Settings;
  createdAt: number;
}

export interface Entry {
  id: string;
  input: string;
  versions: Version[];
  createdAt: number;
}

export const VERSION_KIND_LABEL: Record<VersionKind, string> = {
  humanise: "Humanised",
  alternative: "Alternative",
  again: "Humanised again",
  sentence: "Sentence edit",
};

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
