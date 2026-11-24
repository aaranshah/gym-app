"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClientError, fetchStatus, streamHumanise, type EngineStatus } from "@/lib/client";
import { checkFidelity } from "@/lib/engine/fidelity";
import { DEFAULT_SETTINGS, LIMITS, SettingsSchema, type Settings } from "@/lib/engine/options";
import { analyseStyle } from "@/lib/engine/style";
import type { HumaniseResult } from "@/lib/engine/types";
import { uid, type Entry, type Version } from "@/lib/workspace";
import { Header } from "./Header";
import { HistoryDrawer } from "./HistoryDrawer";
import { InputPanel } from "./InputPanel";
import { OutputPanel, type RunState } from "./OutputPanel";
import type { FidelityView } from "./ReportSheet";
import { SettingsBar } from "./SettingsBar";
import { cx } from "./ui";

const SETTINGS_KEY = "cadence.settings.v1";

type RunKind = RunState["kind"];

export function Workspace() {
  const [input, setInput] = useState("");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [versionIndex, setVersionIndex] = useState(0);
  const [run, setRun] = useState<RunState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<EngineStatus | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"input" | "output">("input");
  const [toast, setToast] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastKind = useRef<RunKind>("humanise");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore preferences (settings only — never text).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = SettingsSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setSettings(parsed.data);
      }
    } catch {
      /* storage unavailable */
    }
    void fetchStatus().then(setStatus);
  }, []);
  const updateSettings = (s: Settings) => {
    setSettings(s);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  };

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const entry = entries.find((e) => e.id === activeId) ?? null;
  const version = entry?.versions[versionIndex] ?? null;

  const start = useCallback(
    async (kind: RunKind) => {
      if (run) return; // prevent duplicate submissions
      let text: string;
      let previousVersions: string[] = [];
      let target: Entry | null = entry;
      if (kind === "humanise") {
        text = input;
        if (!entry || entry.input !== input) target = null;
      } else {
        if (!entry || !version) return;
        if (kind === "alternative") {
          text = entry.input;
          previousVersions = entry.versions
            .filter((v) => v.kind === "humanise" || v.kind === "alternative")
            .slice(-LIMITS.maxPreviousVersions)
            .map((v) => v.text);
        } else {
          text = version.text;
        }
      }
      if (!text.trim()) return;

      lastKind.current = kind;
      const runSettings = settings;
      const ac = new AbortController();
      abortRef.current = ac;
      setError(null);
      setMobileTab("output");
      setRun({ kind, stage: null, pass: 0, draft: "" });

      try {
        let result: HumaniseResult | null = null;
        await streamHumanise(
          { text, settings: runSettings, previousVersions },
          (e) => {
            if (e.type === "stage") setRun((r) => (r ? { ...r, stage: e.stage, pass: e.pass ?? r.pass } : r));
            else if (e.type === "delta") setRun((r) => (r ? { ...r, draft: r.draft + e.text } : r));
            else if (e.type === "result") result = e.result;
          },
          ac.signal,
        );
        const res = result as HumaniseResult | null;
        if (!res) throw new ClientError("incomplete", "No result was returned.");
        const v: Version = { id: uid(), text: res.text, kind, result: res, settings: runSettings, createdAt: Date.now() };
        if (target) {
          const t = target;
          setEntries((es) => es.map((e) => (e.id === t.id ? { ...e, versions: [...e.versions, v] } : e)));
          setVersionIndex(t.versions.length);
        } else {
          const e: Entry = { id: uid(), input: text, versions: [v], createdAt: Date.now() };
          setEntries((es) => [...es, e]);
          setActiveId(e.id);
          setVersionIndex(0);
        }
      } catch (e) {
        if (e instanceof ClientError && e.code === "aborted") {
          notify("Cancelled");
        } else {
          setError(e instanceof Error ? e.message : "Something went wrong.");
          if (e instanceof ClientError && e.code === "not_configured") void fetchStatus().then(setStatus);
        }
      } finally {
        abortRef.current = null;
        setRun(null);
      }
    },
    [run, entry, version, input, settings, notify],
  );

  const cancel = () => abortRef.current?.abort();

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (!ok) {
        notify("Couldn't copy — select the text and copy manually.");
        return false;
      }
    }
    notify("Copied to clipboard");
    return true;
  };

  const replaceSentence = (startIdx: number, endIdx: number, replacement: string) => {
    if (!entry || !version) return;
    const text = version.text.slice(0, startIdx) + replacement + version.text.slice(endIdx);
    const v: Version = { id: uid(), text, kind: "sentence", settings: version.settings, createdAt: Date.now() };
    setEntries((es) => es.map((e) => (e.id === entry.id ? { ...e, versions: [...e.versions, v] } : e)));
    setVersionIndex(entry.versions.length);
    notify("Sentence replaced — use ‹ to undo");
  };

  const fidelity: FidelityView | null = useMemo(() => {
    if (!entry || !version) return null;
    if (version.result) return { kind: "full", result: version.result };
    return {
      kind: "local",
      det: checkFidelity(entry.input, version.text, version.settings),
      before: analyseStyle(entry.input),
      after: analyseStyle(version.text),
    };
  }, [entry, version]);

  const disabledReason = status && !status.configured ? "AI engine not configured" : null;

  return (
    <div className="flex h-dvh flex-col">
      <Header mock={!!status?.mock} historyCount={entries.length} onOpenHistory={() => setHistoryOpen(true)} />

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 pb-3 sm:px-6">
        <SettingsBar settings={settings} onChange={updateSettings} />
        <div role="tablist" aria-label="Panels" className="flex w-full rounded-[10px] bg-sunken p-0.5 lg:hidden">
          {(["input", "output"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={mobileTab === t}
              onClick={() => setMobileTab(t)}
              data-testid={`tab-${t}`}
              className={cx(
                "h-8 flex-1 rounded-[8px] text-[13.5px] font-medium transition-all",
                mobileTab === t ? "bg-surface text-ink shadow-sm" : "text-muted",
              )}
            >
              {t === "input" ? "Original" : "Humanised"}
              {t === "output" && run && <span className="ml-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent align-middle" />}
            </button>
          ))}
        </div>
      </div>

      <main className="flex min-h-0 flex-1 gap-4 px-4 pb-4 sm:px-6 sm:pb-6">
        <div className={cx("min-h-0 min-w-0 flex-1 flex-col", mobileTab === "input" ? "flex" : "hidden", "lg:flex")}>
          <InputPanel
            value={input}
            onChange={setInput}
            onSubmit={() => void start("humanise")}
            onCancel={cancel}
            busy={!!run}
            stage={run?.stage ?? null}
            disabledReason={disabledReason}
            onNotify={notify}
          />
        </div>
        <div className={cx("min-h-0 min-w-0 flex-1 flex-col", mobileTab === "output" ? "flex" : "hidden", "lg:flex")}>
          <OutputPanel
            entry={entry}
            versionIndex={versionIndex}
            onVersionIndex={setVersionIndex}
            run={run}
            error={error}
            onRetry={() => void start(lastKind.current)}
            status={status}
            settings={settings}
            fidelity={fidelity}
            onCopy={copy}
            onAlternative={() => void start("alternative")}
            onAgain={() => void start("again")}
            onClear={() => {
              setActiveId(null);
              setError(null);
              setMobileTab("input");
            }}
            onReplaceSentence={replaceSentence}
          />
        </div>
      </main>

      <HistoryDrawer
        open={historyOpen}
        entries={entries}
        activeId={activeId}
        onClose={() => setHistoryOpen(false)}
        onSelect={(id) => {
          const e = entries.find((x) => x.id === id);
          if (!e) return;
          setActiveId(id);
          setVersionIndex(e.versions.length - 1);
          setInput(e.input);
          setError(null);
          setHistoryOpen(false);
          setMobileTab("output");
        }}
      />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        {toast && (
          <div className="animate-fade-up rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-bg shadow-lg" data-testid="toast">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
