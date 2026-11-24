"use client";
import { FileUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LIMITS } from "@/lib/engine/options";
import { countChars, countWords } from "@/lib/engine/text";
import { ACCEPTED_EXTENSIONS, importFile } from "@/lib/importFile";
import { Button, IconButton, Kbd, Spinner, cx } from "./ui";

export const STAGE_LABEL = {
  rewriting: "Rewriting…",
  verifying: "Checking meaning…",
  refining: "Refining…",
} as const;

export function InputPanel({
  value,
  onChange,
  onSubmit,
  onCancel,
  busy,
  stage,
  disabledReason,
  onNotify,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  busy: boolean;
  stage: keyof typeof STAGE_LABEL | null;
  disabledReason: string | null;
  onNotify: (msg: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [dragging, setDragging] = useState(false);

  // Keep text typed (or restored by the browser) before React hydrated.
  useEffect(() => {
    const domValue = areaRef.current?.value;
    if (domValue && !value) onChange(domValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const words = countWords(value);
  const chars = countChars(value);
  const over = chars > LIMITS.maxChars;
  const tooShort = value.trim().length > 0 && value.trim().length < LIMITS.minChars;

  const load = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await importFile(file);
      if (!text.trim()) throw new Error("The file appears to be empty.");
      onChange(text);
      onNotify(`Imported ${file.name}`);
    } catch (e) {
      onNotify(e instanceof Error ? e.message : "Couldn't read that file.");
    }
  };

  const reason =
    disabledReason ??
    (over
      ? `Too long — ${chars.toLocaleString()} / ${LIMITS.maxChars.toLocaleString()} characters`
      : !value.trim()
        ? null
        : tooShort
          ? "Add a little more text"
          : null);
  const canSubmit = !busy && !!value.trim() && !reason;

  return (
    <section
      aria-label="Original text"
      className={cx(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border bg-surface shadow-sm transition-colors",
        dragging ? "border-accent" : "border-line",
      )}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setDragging(false);
        void load(e.dataTransfer.files[0]);
      }}
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line px-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Original</h2>
        <div className="flex items-center gap-0.5">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            data-testid="file-input"
            onChange={(e) => {
              void load(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} title="Import .txt, .md or .docx (read in your browser)">
            <FileUp size={15} strokeWidth={1.8} />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <IconButton label="Clear text" onClick={() => onChange("")} disabled={!value || busy} data-testid="clear-input">
            <X size={16} strokeWidth={1.8} />
          </IconButton>
        </div>
      </div>

      <textarea
        ref={areaRef}
        aria-label="Text to humanise"
        data-testid="input-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            if (canSubmit) onSubmit();
          }
        }}
        placeholder={
          "Paste or type the text you want to sound more natural.\n\nCadence rewrites for flow, rhythm and clarity — and checks that every fact, number, quote and caveat survives."
        }
        spellCheck
        className="prose-text scroll-thin focus-inset min-h-[220px] flex-1 resize-none bg-transparent px-5 py-4 outline-none sm:px-6"
      />
      {dragging && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-accent-soft/80 text-[14px] font-medium text-accent">
          Drop to import
        </div>
      )}

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <p className={cx("text-[12.5px] tabular-nums", over ? "text-danger" : "text-muted")} aria-live="polite" data-testid="input-counts">
          {reason && value.trim() ? (
            reason
          ) : (
            <>
              {words.toLocaleString()} {words === 1 ? "word" : "words"} · {chars.toLocaleString()} characters
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          {busy && (
            <Button variant="ghost" size="sm" onClick={onCancel} data-testid="cancel-button">
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={onSubmit}
            disabled={!canSubmit}
            aria-busy={busy}
            data-testid="humanise-button"
            title={reason ?? "Humanise (Ctrl/⌘ + Enter)"}
            className="min-w-[148px]"
          >
            {busy ? (
              <>
                <Spinner />
                {stage ? STAGE_LABEL[stage] : "Starting…"}
              </>
            ) : (
              <>
                Humanise
                <span className="hidden items-center gap-0.5 sm:inline-flex">
                  <Kbd>⌘</Kbd>
                  <Kbd>↵</Kbd>
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
