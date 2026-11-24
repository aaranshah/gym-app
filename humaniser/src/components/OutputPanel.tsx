"use client";
import { Check, ChevronLeft, ChevronRight, Copy, RefreshCw, Sparkles, Trash2, AlertCircle, KeyRound } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { changeRatio, diffText } from "@/lib/diff";
import type { EngineStatus } from "@/lib/client";
import type { Settings } from "@/lib/engine/options";
import { countChars, countWords, splitSentences } from "@/lib/engine/text";
import type { Stage } from "@/lib/engine/types";
import { VERSION_KIND_LABEL, type Entry } from "@/lib/workspace";
import { DiffView } from "./DiffView";
import { ReportSheet, fidelityBadge, type FidelityView } from "./ReportSheet";
import { SentenceEditor } from "./SentenceEditor";
import { Button, IconButton, Segmented, Spinner, cx } from "./ui";

export interface RunState {
  kind: "humanise" | "alternative" | "again";
  stage: Stage | null;
  pass: number;
  draft: string;
}

const STEPS: { key: Stage; label: string }[] = [
  { key: "rewriting", label: "Rewrite" },
  { key: "verifying", label: "Check meaning" },
  { key: "refining", label: "Refine" },
];

export function OutputPanel({
  entry,
  versionIndex,
  onVersionIndex,
  run,
  error,
  onRetry,
  status,
  settings,
  fidelity,
  onCopy,
  onAlternative,
  onAgain,
  onClear,
  onReplaceSentence,
}: {
  entry: Entry | null;
  versionIndex: number;
  onVersionIndex: (i: number) => void;
  run: RunState | null;
  error: string | null;
  onRetry: () => void;
  status: EngineStatus | null;
  settings: Settings;
  fidelity: FidelityView | null;
  onCopy: (text: string) => Promise<boolean>;
  onAlternative: () => void;
  onAgain: () => void;
  onClear: () => void;
  onReplaceSentence: (start: number, end: number, text: string) => void;
}) {
  const [view, setView] = useState<"text" | "changes">("text");
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [active, setActive] = useState<{ start: number; end: number } | null>(null);

  const version = entry?.versions[versionIndex] ?? null;
  const text = version?.text ?? "";
  const busy = !!run;

  useEffect(() => {
    setActive(null);
    setReportOpen(false);
  }, [version?.id]);

  const ratio = useMemo(() => (entry && version ? changeRatio(diffText(entry.input, version.text)) : 0), [entry, version]);

  const copy = async () => {
    if (await onCopy(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const showDraft = busy;
  const badge = fidelity ? fidelityBadge(fidelity) : null;

  return (
    <section
      aria-label="Humanised text"
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-line bg-surface shadow-sm"
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line px-4">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Humanised</h2>
          {version && !busy && entry && (
            <div className="flex items-center gap-0.5 text-[12.5px] text-muted" data-testid="version-nav">
              <IconButton
                label="Previous version (undo)"
                className="h-7 w-7"
                disabled={versionIndex === 0}
                onClick={() => onVersionIndex(versionIndex - 1)}
                data-testid="version-prev"
              >
                <ChevronLeft size={15} />
              </IconButton>
              <span className="min-w-[3.2em] text-center tabular-nums" aria-live="polite" title={VERSION_KIND_LABEL[version.kind]}>
                {versionIndex + 1} / {entry.versions.length}
              </span>
              <IconButton
                label="Next version (redo)"
                className="h-7 w-7"
                disabled={versionIndex >= entry.versions.length - 1}
                onClick={() => onVersionIndex(versionIndex + 1)}
                data-testid="version-next"
              >
                <ChevronRight size={15} />
              </IconButton>
              <span className="ml-1 hidden truncate md:inline">{VERSION_KIND_LABEL[version.kind]}</span>
            </div>
          )}
        </div>
        {version && !busy && (
          <div className="flex items-center gap-0.5">
            <IconButton label={copied ? "Copied" : "Copy text"} onClick={copy} data-testid="copy-button">
              {copied ? <Check size={16} className="text-ok" /> : <Copy size={15} strokeWidth={1.8} />}
            </IconButton>
            <IconButton label="Generate an alternative version" onClick={onAlternative} data-testid="alternative-button">
              <RefreshCw size={15} strokeWidth={1.8} />
            </IconButton>
            <IconButton label="Humanise this output again" onClick={onAgain} data-testid="again-button">
              <Sparkles size={15} strokeWidth={1.8} />
            </IconButton>
            <IconButton label="Clear output" onClick={onClear} data-testid="clear-output">
              <Trash2 size={15} strokeWidth={1.8} />
            </IconButton>
          </div>
        )}
      </div>

      {version && !busy && (
        <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-3 sm:px-6">
          <Segmented
            size="sm"
            label="Output view"
            value={view}
            onChange={setView}
            options={[
              { value: "text", label: "Text" },
              { value: "changes", label: "Changes" },
            ]}
          />
          {view === "text" && <p className="hidden text-[12px] text-faint sm:block">Click a sentence to rewrite it</p>}
          {view === "changes" && (
            <p className="flex items-center gap-2 text-[12px] text-muted">
              <span className="diff-del">removed</span>
              <span className="diff-ins">added</span>
            </p>
          )}
        </div>
      )}

      <div className="scroll-thin relative min-h-[220px] flex-1 overflow-y-auto px-5 py-4 sm:px-6" data-testid="output-body">
        {busy && <Stepper run={run} />}
        {error && !busy && (
          <div role="alert" className="animate-fade-up flex items-start gap-3 rounded-[12px] border border-danger/25 bg-danger-soft px-4 py-3" data-testid="error-message">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-danger">Couldn&apos;t humanise this text</p>
              <p className="mt-0.5 text-[13.5px] text-ink-2">{error}</p>
            </div>
            <Button size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}

        {showDraft ? (
          run.draft ? (
            <div className="prose-text caret mt-4 whitespace-pre-wrap break-words" data-testid="draft-text" aria-live="off">
              {run.draft}
            </div>
          ) : (
            <div className="mt-5 space-y-3" aria-hidden>
              {[92, 100, 84, 96, 70].map((w, i) => (
                <div key={i} className="skeleton h-4" style={{ width: `${w}%` }} />
              ))}
            </div>
          )
        ) : version ? (
          view === "changes" && entry ? (
            <div className={cx(error && "mt-4")}>
              <DiffView original={entry.input} revised={text} />
            </div>
          ) : (
            <SentenceText
              key={version.id}
              text={text}
              active={active}
              onSelect={setActive}
              renderEditor={(span, context) => (
                <SentenceEditor
                  sentence={text.slice(span.start, span.end)}
                  context={context}
                  sourceText={entry?.input ?? ""}
                  settings={settings}
                  onClose={() => setActive(null)}
                  onReplace={(t) => {
                    onReplaceSentence(span.start, span.end, t);
                    setActive(null);
                  }}
                />
              )}
            />
          )
        ) : (
          !error && <EmptyState status={status} />
        )}
      </div>

      {version && !busy && (
        <div className="flex min-h-[68px] shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
          <p className="text-[12.5px] tabular-nums text-muted" data-testid="output-counts">
            {countWords(text).toLocaleString()} words · {countChars(text).toLocaleString()} characters
            <span className="hidden sm:inline"> · {Math.round(ratio * 100)}% changed</span>
          </p>
          {badge && (
            <button
              type="button"
              onClick={() => setReportOpen((o) => !o)}
              aria-expanded={reportOpen}
              data-testid="fidelity-badge"
              className={cx(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-medium transition-colors",
                badge.tone === "ok" && "bg-accent-soft text-accent hover:brightness-95",
                badge.tone === "warn" && "bg-warn-soft text-warn hover:brightness-95",
                badge.tone === "neutral" && "bg-sunken text-ink-2 hover:bg-line",
              )}
            >
              <span className={cx("h-1.5 w-1.5 rounded-full", badge.tone === "ok" ? "bg-ok" : badge.tone === "warn" ? "bg-warn" : "bg-muted")} />
              {badge.label}
            </button>
          )}
        </div>
      )}
      {reportOpen && fidelity && !busy && <ReportSheet view={fidelity} onClose={() => setReportOpen(false)} />}
    </section>
  );
}

function Stepper({ run }: { run: RunState }) {
  const idx = run.stage ? STEPS.findIndex((s) => s.key === run.stage) : 0;
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]" aria-live="polite" data-testid="stage-indicator">
      {STEPS.map((s, i) => {
        const state = i < idx ? "done" : i === idx ? "active" : "todo";
        if (s.key === "refining" && state === "todo") return null;
        return (
          <li key={s.key} className="flex items-center gap-2">
            {i > 0 && <span className="h-px w-4 bg-line-strong" aria-hidden />}
            <span className={cx("flex items-center gap-1.5", state === "active" ? "font-medium text-ink" : state === "done" ? "text-ok" : "text-faint")}>
              {state === "active" ? <Spinner className="h-3.5 w-3.5 text-accent" /> : state === "done" ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              {s.label}
              {s.key === "refining" && run.pass > 0 ? ` (pass ${run.pass})` : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function EmptyState({ status }: { status: EngineStatus | null }) {
  if (status && !status.configured) {
    return (
      <div className="mx-auto mt-10 max-w-sm text-center" data-testid="not-configured">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-warn-soft text-warn">
          <KeyRound size={18} />
        </div>
        <p className="mt-3 text-[15px] font-medium text-ink">AI engine not configured</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
          Add <code className="rounded bg-sunken px-1 py-0.5 font-mono text-[12.5px]">ANTHROPIC_API_KEY</code> to{" "}
          <code className="rounded bg-sunken px-1 py-0.5 font-mono text-[12.5px]">.env.local</code> and restart the server. See the README for
          setup.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto mt-10 max-w-sm text-center text-muted">
      <p className="prose-text text-[17px] italic text-ink-2">Your rewrite will appear here.</p>
      <p className="mt-2 text-[13px] leading-relaxed">
        Choose how much to change and the tone, then press <span className="font-medium text-ink-2">Humanise</span>. Every rewrite is checked
        for lost or altered facts before you see it.
      </p>
    </div>
  );
}

/** Output text rendered as clickable sentences, with an inline editor for the active one. */
function SentenceText({
  text,
  active,
  onSelect,
  renderEditor,
}: {
  text: string;
  active: { start: number; end: number } | null;
  onSelect: (s: { start: number; end: number } | null) => void;
  renderEditor: (span: { start: number; end: number }, context: string) => React.ReactNode;
}) {
  const spans = useMemo(() => splitSentences(text), [text]);
  const container = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);
  const [top, setTop] = useState(0);

  const measure = useCallback(() => {
    if (!activeRef.current || !container.current) return;
    const rects = activeRef.current.getClientRects();
    const last = rects[rects.length - 1];
    const base = container.current.getBoundingClientRect();
    if (last) setTop(last.bottom - base.top + 8);
  }, []);
  useLayoutEffect(() => {
    if (active) measure();
  }, [active, measure]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const contextFor = (start: number, end: number) => {
    const before = text.lastIndexOf("\n\n", start);
    const after = text.indexOf("\n\n", end);
    return text.slice(before === -1 ? 0 : before, after === -1 ? text.length : after).trim();
  };

  return (
    <div ref={container} className="relative pb-48">
      <div className="prose-text whitespace-pre-wrap break-words" data-testid="output-text">
        {spans.map((s) => {
          const body = s.text.replace(/\s+$/, "");
          const trail = s.text.slice(body.length);
          if (!/[\p{L}\p{N}]/u.test(body)) return <span key={s.start}>{s.text}</span>;
          const end = s.start + body.length;
          const isActive = active?.start === s.start;
          return (
            <span key={s.start}>
              <span
                ref={isActive ? activeRef : undefined}
                role="button"
                tabIndex={0}
                className="sentence"
                data-active={isActive}
                aria-label={`Rewrite sentence: ${body.slice(0, 60)}`}
                onClick={() => onSelect(isActive ? null : { start: s.start, end })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(isActive ? null : { start: s.start, end });
                  }
                }}
              >
                {body}
              </span>
              {trail}
            </span>
          );
        })}
      </div>
      {active && (
        <div className="absolute inset-x-0 z-20" style={{ top }}>
          {renderEditor(active, contextFor(active.start, active.end))}
        </div>
      )}
    </div>
  );
}
