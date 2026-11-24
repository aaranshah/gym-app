"use client";
import { AlertTriangle, Check, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ClientError, rewriteSentence } from "@/lib/client";
import type { Settings } from "@/lib/engine/options";
import type { SentenceResult } from "@/lib/engine/types";
import { Button, IconButton, Spinner } from "./ui";

/**
 * Floating editor for a single sentence: asks the engine for three faithful
 * alternatives and lets the user swap one in.
 */
export function SentenceEditor({
  sentence,
  context,
  sourceText,
  settings,
  onReplace,
  onClose,
}: {
  sentence: string;
  context: string;
  sourceText: string;
  settings: Settings;
  onReplace: (text: string) => void;
  onClose: () => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [state, setState] = useState<
    { s: "idle" } | { s: "loading" } | { s: "done"; data: SentenceResult } | { s: "error"; msg: string }
  >({ s: "idle" });
  const abort = useRef<AbortController | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    root.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      abort.current?.abort();
    };
  }, [onClose]);

  const run = async () => {
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setState({ s: "loading" });
    try {
      const data = await rewriteSentence(
        { sentence: sentence.trim(), context, sourceText, instruction: instruction.trim(), settings },
        ac.signal,
      );
      setState({ s: "done", data });
    } catch (e) {
      if (e instanceof ClientError && e.code === "aborted") return;
      setState({ s: "error", msg: e instanceof Error ? e.message : "Something went wrong." });
    }
  };

  return (
    <div
      ref={root}
      role="dialog"
      aria-label="Rewrite sentence"
      data-testid="sentence-editor"
      className="animate-fade-up rounded-[14px] border border-line bg-surface p-3.5 font-sans shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Rewrite this sentence</p>
        <IconButton label="Close" onClick={onClose} className="-mr-1.5 -mt-1.5 h-7 w-7">
          <X size={14} />
        </IconButton>
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        <input
          data-autofocus
          value={instruction}
          onChange={(e) => setInstruction(e.target.value.slice(0, 300))}
          placeholder="Optional: e.g. make it punchier"
          aria-label="Instruction for this sentence"
          className="h-9 min-w-0 flex-1 rounded-[9px] border border-line bg-surface-2 px-3 text-[13.5px] text-ink placeholder:text-faint"
        />
        <Button type="submit" variant="primary" disabled={state.s === "loading"} data-testid="sentence-generate">
          {state.s === "loading" ? <Spinner /> : state.s === "done" ? <RefreshCw size={14} /> : null}
          {state.s === "done" ? "Retry" : "Suggest"}
        </Button>
      </form>

      {state.s === "loading" && (
        <div className="mt-3 space-y-2" aria-live="polite" aria-label="Generating alternatives">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-12" />
          ))}
        </div>
      )}
      {state.s === "error" && (
        <p role="alert" className="mt-3 rounded-[9px] bg-danger-soft px-3 py-2 text-[13px] text-danger">
          {state.msg}
        </p>
      )}
      {state.s === "done" && (
        <ul className="mt-3 space-y-1.5" data-testid="sentence-options">
          {state.data.options.map((o, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onReplace(o.text)}
                className="group w-full rounded-[10px] border border-line px-3 py-2 text-left transition-colors hover:border-accent/50 hover:bg-accent-soft/50"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-muted">{o.approach}</span>
                  <span className="flex items-center gap-1 text-[12px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Check size={13} /> Use this
                  </span>
                </span>
                <span className="prose-text mt-0.5 block text-[15px] leading-[1.6]">{o.text}</span>
                {o.warnings.length > 0 && (
                  <span className="mt-1 flex items-start gap-1.5 text-[12px] text-warn">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    {o.warnings[0]}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
