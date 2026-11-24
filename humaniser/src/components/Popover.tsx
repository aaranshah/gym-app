"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cx } from "./ui";

/**
 * Minimal accessible popover: a trigger button toggles a panel; Escape or a
 * click outside closes it and focus returns to the trigger.
 */
export function Popover({
  trigger,
  children,
  align = "end",
  panelClassName,
  label,
}: {
  trigger: (props: { open: boolean; toggle: () => void; id: string }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "start" | "end";
  panelClassName?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        (root.current?.querySelector("[aria-controls]") as HTMLElement | null)?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  return (
    <div ref={root} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o), id })}
      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={label}
          className={cx(
            "animate-fade-up absolute top-full z-40 mt-2 rounded-[14px] border border-line bg-surface p-4 shadow-lg",
            align === "end" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}
