"use client";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { INTENSITY_META, TONE_META } from "@/lib/engine/options";
import type { Entry } from "@/lib/workspace";
import { IconButton, cx } from "./ui";

export function HistoryDrawer({
  open,
  entries,
  activeId,
  onSelect,
  onClose,
}: {
  open: boolean;
  entries: Entry[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" data-testid="history-drawer">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Session history"
        className="animate-fade-up absolute inset-y-0 right-0 flex w-[min(380px,100vw)] flex-col border-l border-line bg-surface shadow-lg outline-none"
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-5">
          <div>
            <h2 className="text-[14px] font-semibold text-ink">Session history</h2>
            <p className="text-[12px] text-muted">Kept in this tab only — cleared when you close it.</p>
          </div>
          <IconButton label="Close history" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto p-3">
          {entries.length === 0 ? (
            <p className="px-2 py-8 text-center text-[13.5px] text-muted">Nothing yet. Your rewrites from this session will appear here.</p>
          ) : (
            <ul className="space-y-1.5">
              {[...entries].reverse().map((e) => {
                const last = e.versions[e.versions.length - 1];
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(e.id)}
                      className={cx(
                        "w-full rounded-[12px] border px-3.5 py-3 text-left transition-colors",
                        e.id === activeId ? "border-accent/40 bg-accent-soft/60" : "border-transparent hover:border-line hover:bg-surface-2",
                      )}
                    >
                      <p className="line-clamp-2 font-serif text-[14.5px] leading-snug text-ink">{last?.text ?? e.input}</p>
                      <p className="mt-1.5 text-[12px] text-muted">
                        {new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                        {e.versions.length} version{e.versions.length === 1 ? "" : "s"}
                        {last && ` · ${INTENSITY_META[last.settings.intensity].label}, ${TONE_META[last.settings.tone].label}`}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
