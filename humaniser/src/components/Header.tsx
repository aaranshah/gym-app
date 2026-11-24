"use client";
import { History, Monitor, Moon, ShieldCheck, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Popover } from "./Popover";
import { IconButton, cx } from "./ui";

type Theme = "system" | "light" | "dark";

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    try {
      const t = localStorage.getItem("cadence.theme");
      if (t === "light" || t === "dark") setTheme(t);
    } catch {
      /* storage unavailable */
    }
  }, []);
  const apply = (t: Theme) => {
    setTheme(t);
    if (t === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    try {
      if (t === "system") localStorage.removeItem("cadence.theme");
      else localStorage.setItem("cadence.theme", t);
    } catch {
      /* ignore */
    }
  };
  const next: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label = { system: "Theme: system", light: "Theme: light", dark: "Theme: dark" }[theme];
  return (
    <IconButton label={`${label} (click to change)`} onClick={() => apply(next[theme])} data-testid="theme-toggle">
      <Icon size={16} strokeWidth={1.8} />
    </IconButton>
  );
}

export function Header({
  mock,
  historyCount,
  onOpenHistory,
}: {
  mock: boolean;
  historyCount: number;
  onOpenHistory: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 px-4 sm:px-6">
      <div className="flex items-center gap-2.5">
        <Logo />
        <span className="text-[16px] font-semibold tracking-[-0.01em] text-ink">Cadence</span>
        {mock && (
          <span
            className="rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-medium text-warn"
            title="HUMANISER_MOCK=1 — a deterministic stand-in engine for testing. Not real AI rewriting."
            data-testid="demo-badge"
          >
            Demo engine
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Popover
          label="Privacy"
          panelClassName="w-[300px]"
          trigger={({ open, toggle, id }) => (
            <IconButton label="Privacy" onClick={toggle} aria-expanded={open} aria-controls={id} active={open}>
              <ShieldCheck size={16} strokeWidth={1.8} />
            </IconButton>
          )}
        >
          <h2 className="text-[14px] font-semibold text-ink">Your text stays yours</h2>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-ink-2">
            <li>Text is sent to the AI provider only to produce your rewrite.</li>
            <li>Cadence doesn&apos;t store or log the text you submit.</li>
            <li>History lives only in this tab and disappears when you close it.</li>
            <li>Imported files are read in your browser, never uploaded.</li>
          </ul>
        </Popover>
        <div className="relative">
          <IconButton label="Session history" onClick={onOpenHistory} data-testid="history-button">
            <History size={16} strokeWidth={1.8} />
          </IconButton>
          {historyCount > 0 && (
            <span
              className={cx(
                "pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-ink",
              )}
            >
              {historyCount}
            </span>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-accent">
      <rect x="1" y="1" width="22" height="22" rx="7" fill="currentColor" />
      <path d="M6 15.5c1.6-4.5 3.2-4.5 4.8 0s3.2 4.5 4.8 0 1.6-3 2.4-3" stroke="var(--accent-ink)" strokeWidth="1.9" fill="none" strokeLinecap="round" />
    </svg>
  );
}
