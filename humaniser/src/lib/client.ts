"use client";
import type { HumaniseRequest, SentenceRequest } from "./engine/options";
import type { PipelineEvent, SentenceResult } from "./engine/types";

export class ClientError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function errorFrom(res: Response): Promise<ClientError> {
  try {
    const body = await res.json();
    if (body?.error?.message) return new ClientError(body.error.code ?? "error", body.error.message);
  } catch {
    /* fallthrough */
  }
  if (res.status === 429) return new ClientError("rate_limited", "Too many requests — please wait a moment.");
  return new ClientError("http", `The server returned an error (${res.status}).`);
}

/** POST /api/humanise and dispatch NDJSON pipeline events as they arrive. */
export async function streamHumanise(
  body: Omit<HumaniseRequest, "previousVersions"> & { previousVersions?: string[] },
  onEvent: (e: PipelineEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/humanise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (signal.aborted) throw new ClientError("aborted", "Cancelled.");
    throw new ClientError("network", "Couldn't reach the server. Check your connection and try again.");
    void e;
  }
  if (!res.ok || !res.body) throw await errorFrom(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let gotResult = false;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        const evt = JSON.parse(line) as PipelineEvent;
        if (evt.type === "error") throw new ClientError(evt.code, evt.message);
        if (evt.type === "result") gotResult = true;
        onEvent(evt);
      }
    }
  } catch (e) {
    if (e instanceof ClientError) throw e;
    if (signal.aborted) throw new ClientError("aborted", "Cancelled.");
    throw new ClientError("network", "The connection was interrupted. Please try again.");
  }
  if (!gotResult) throw new ClientError("incomplete", "The response ended unexpectedly. Please try again.");
}

export async function rewriteSentence(body: SentenceRequest, signal: AbortSignal): Promise<SentenceResult> {
  let res: Response;
  try {
    res = await fetch("/api/sentence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    if (signal.aborted) throw new ClientError("aborted", "Cancelled.");
    throw new ClientError("network", "Couldn't reach the server.");
  }
  if (!res.ok) throw await errorFrom(res);
  return res.json();
}

export interface EngineStatus {
  configured: boolean;
  mock: boolean;
  model: string;
  limits: { maxChars: number };
}

export async function fetchStatus(): Promise<EngineStatus | null> {
  try {
    const r = await fetch("/api/status", { cache: "no-store" });
    return r.ok ? r.json() : null;
  } catch {
    return null;
  }
}
