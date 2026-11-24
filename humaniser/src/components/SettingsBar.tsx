"use client";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import {
  DEFAULT_SETTINGS,
  ENGLISH_VARIANTS,
  ENGLISH_VARIANT_META,
  INTENSITIES,
  INTENSITY_META,
  LANGUAGES,
  LENGTH_META,
  LENGTH_MODES,
  LIMITS,
  TONES,
  TONE_META,
  type Settings,
} from "@/lib/engine/options";
import { Popover } from "./Popover";
import { Button, Segmented, Select, Switch, cx } from "./ui";

const PRESET_INSTRUCTIONS = [
  "Preserve my writing style",
  "Make it less formal",
  "Improve the flow",
  "Avoid unnecessary jargon",
  "Make it more concise",
];

export function countCustomised(s: Settings): number {
  let n = 0;
  if (s.englishVariant !== DEFAULT_SETTINGS.englishVariant) n++;
  if (s.language !== DEFAULT_SETTINGS.language) n++;
  if (s.lengthMode !== DEFAULT_SETTINGS.lengthMode) n++;
  if (s.preserveParagraphs !== DEFAULT_SETTINGS.preserveParagraphs) n++;
  if (s.preserveTerminology !== DEFAULT_SETTINGS.preserveTerminology) n++;
  if (s.customInstructions.trim()) n++;
  if (s.protectedPhrases.length) n++;
  return n;
}

export function SettingsBar({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => onChange({ ...settings, [k]: v });
  const customised = countCustomised(settings);

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3" data-testid="settings-bar">
      <Segmented
        label="Rewrite intensity"
        value={settings.intensity}
        onChange={(v) => set("intensity", v)}
        options={INTENSITIES.map((i) => ({ value: i, label: INTENSITY_META[i].label, hint: INTENSITY_META[i].hint }))}
      />
      <Select
        label="Tone"
        hideLabel
        className="w-[188px]"
        value={settings.tone}
        onChange={(v) => set("tone", v)}
        options={TONES.map((t) => ({ value: t, label: TONE_META[t].label }))}
      />
      <Popover
        label="More options"
        align="start"
        panelClassName="max-sm:fixed max-sm:inset-x-4 max-sm:top-[7.5rem] sm:w-[380px] max-h-[min(70vh,640px)] overflow-y-auto scroll-thin"
        trigger={({ open, toggle, id }) => (
          <Button variant="secondary" onClick={toggle} aria-expanded={open} aria-controls={id} data-testid="options-button">
            <SlidersHorizontal size={15} strokeWidth={1.8} />
            Options
            {customised > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-soft px-1 text-[11px] font-semibold text-accent">
                {customised}
              </span>
            )}
          </Button>
        )}
      >
        <OptionsPanel settings={settings} onChange={onChange} />
      </Popover>
    </div>
  );
}

function OptionsPanel({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => onChange({ ...settings, [k]: v });
  const [phrase, setPhrase] = useState("");

  const addPhrase = () => {
    const p = phrase.trim();
    if (!p || settings.protectedPhrases.includes(p) || settings.protectedPhrases.length >= LIMITS.maxProtectedPhrases) return;
    set("protectedPhrases", [...settings.protectedPhrases, p.slice(0, LIMITS.maxProtectedPhraseLength)]);
    setPhrase("");
  };

  return (
    <div className="space-y-5" data-testid="options-panel">
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Spelling"
          value={settings.englishVariant}
          onChange={(v) => set("englishVariant", v)}
          options={ENGLISH_VARIANTS.map((v) => ({ value: v, label: ENGLISH_VARIANT_META[v] }))}
        />
        <Select
          label="Output language"
          value={settings.language}
          onChange={(v) => set("language", v)}
          options={LANGUAGES.map((l) => ({ value: l, label: l === "original" ? "Same as input" : l }))}
        />
      </div>

      <div className="space-y-2">
        <Select
          label="Length"
          value={settings.lengthMode}
          onChange={(v) => onChange({ ...settings, lengthMode: v, targetWords: v === "target" ? settings.targetWords ?? 250 : settings.targetWords })}
          options={LENGTH_MODES.map((m) => ({ value: m, label: LENGTH_META[m] }))}
        />
        {settings.lengthMode === "target" && (
          <label className="flex items-center gap-2 text-[13px] text-muted">
            <input
              type="number"
              min={10}
              max={5000}
              value={settings.targetWords ?? ""}
              onChange={(e) => set("targetWords", e.target.value ? Math.max(10, Math.min(5000, Number(e.target.value))) : undefined)}
              className="h-9 w-28 rounded-[9px] border border-line bg-surface px-3 text-[13.5px] text-ink"
              aria-label="Target word count"
            />
            words
          </label>
        )}
      </div>

      <div className="space-y-3.5 border-t border-line pt-4">
        <Switch
          label="Keep paragraph structure"
          description="Same paragraphs in the same order. Turn off to let Cadence reorganise."
          checked={settings.preserveParagraphs}
          onChange={(v) => set("preserveParagraphs", v)}
        />
        <Switch
          label="Keep technical terms"
          description="Never swap domain terms, acronyms or defined terms for synonyms."
          checked={settings.preserveTerminology}
          onChange={(v) => set("preserveTerminology", v)}
        />
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <label htmlFor="protected-input" className="text-[13.5px] font-medium text-ink">
          Never change
        </label>
        <p className="text-[12.5px] text-muted">Words or phrases that must stay exactly as written.</p>
        <div className="flex gap-2">
          <input
            id="protected-input"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPhrase();
              }
            }}
            placeholder="e.g. Customer Success Programme"
            maxLength={LIMITS.maxProtectedPhraseLength}
            className="h-9 min-w-0 flex-1 rounded-[9px] border border-line bg-surface px-3 text-[13.5px] text-ink placeholder:text-faint"
          />
          <Button onClick={addPhrase} disabled={!phrase.trim()}>
            Add
          </Button>
        </div>
        {settings.protectedPhrases.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pt-1" aria-label="Protected phrases">
            {settings.protectedPhrases.map((p) => (
              <li key={p} className="flex items-center gap-1 rounded-full bg-sunken py-0.5 pl-2.5 pr-1 text-[12.5px] text-ink-2">
                {p}
                <button
                  type="button"
                  aria-label={`Remove ${p}`}
                  onClick={() => set("protectedPhrases", settings.protectedPhrases.filter((x) => x !== p))}
                  className="rounded-full p-0.5 text-muted hover:bg-line hover:text-ink"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <label htmlFor="custom-instructions" className="text-[13.5px] font-medium text-ink">
          Custom instructions
        </label>
        <textarea
          id="custom-instructions"
          value={settings.customInstructions}
          onChange={(e) => set("customInstructions", e.target.value.slice(0, LIMITS.maxCustomInstructions))}
          rows={3}
          placeholder="e.g. Keep my voice. Avoid jargon. Write for a non-specialist reader."
          className="w-full resize-none rounded-[9px] border border-line bg-surface px-3 py-2 text-[13.5px] leading-relaxed text-ink placeholder:text-faint"
        />
        <div className="flex flex-wrap gap-1.5">
          {PRESET_INSTRUCTIONS.map((p) => {
            const on = settings.customInstructions.includes(p);
            return (
              <button
                key={p}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  set(
                    "customInstructions",
                    on
                      ? settings.customInstructions.replace(new RegExp(`\\s*${p}\\.?`), "").trim()
                      : `${settings.customInstructions.trim()}${settings.customInstructions.trim() ? " " : ""}${p}.`.slice(0, LIMITS.maxCustomInstructions),
                  )
                }
                className={cx(
                  "rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                  on ? "border-accent/40 bg-accent-soft text-accent" : "border-line text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end border-t border-line pt-3">
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...DEFAULT_SETTINGS, intensity: settings.intensity, tone: settings.tone })}>
          Reset options
        </Button>
      </div>
    </div>
  );
}
