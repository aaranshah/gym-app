"use client";
import { useMemo } from "react";
import { diffText } from "@/lib/diff";

/** Inline "track changes" view: removed text struck through, added text highlighted. */
export function DiffView({ original, revised }: { original: string; revised: string }) {
  const segments = useMemo(() => diffText(original, revised), [original, revised]);
  return (
    <div className="prose-text whitespace-pre-wrap break-words" data-testid="diff-view">
      {segments.map((s, i) =>
        s.kind === "equal" ? (
          <span key={i}>{s.text}</span>
        ) : (
          <span key={i}>
            {s.removed && (
              <del className="diff-del" aria-label={`removed: ${s.removed}`}>
                {s.removed}
              </del>
            )}
            {s.removed && s.added && !/\s$/.test(s.removed) && " "}
            {s.added && (
              <ins className="diff-ins no-underline" aria-label={`added: ${s.added}`}>
                {s.added}
              </ins>
            )}
          </span>
        ),
      )}
    </div>
  );
}
