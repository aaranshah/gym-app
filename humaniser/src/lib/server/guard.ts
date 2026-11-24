import "server-only";
import { createHash } from "node:crypto";

/**
 * In-memory, per-client request limiting. Suitable for a single server
 * instance; for multi-instance deployments swap in a shared store (Redis etc.).
 * Only a hashed client key is kept — never any request text.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = Number(process.env.HUMANISER_RATE_LIMIT_PER_MIN ?? 12);
const MAX_CONCURRENT = Number(process.env.HUMANISER_MAX_CONCURRENT ?? 2);

const hits = new Map<string, number[]>();
const inflight = new Map<string, number>();

/**
 * Identify the client for rate limiting. Only a truncated hash of the address
 * is held in memory. Note: x-forwarded-for is trusted, so deploy behind a proxy
 * that sets it (Vercel, a load balancer) rather than exposing the server directly.
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || req.headers.get("x-real-ip") || "local";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export type GuardResult = { ok: true; release: () => void } | { ok: false; status: number; message: string; retryAfter?: number };

export function acquire(key: string, weight = 1): GuardResult {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length + weight > MAX_PER_WINDOW) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    return { ok: false, status: 429, message: `Too many requests. Please wait ${retryAfter}s and try again.`, retryAfter };
  }
  const active = inflight.get(key) ?? 0;
  if (active >= MAX_CONCURRENT) {
    return { ok: false, status: 429, message: "A request is already in progress. Please wait for it to finish." };
  }
  for (let i = 0; i < weight; i++) recent.push(now);
  hits.set(key, recent);
  inflight.set(key, active + 1);
  let released = false;
  return {
    ok: true,
    release: () => {
      if (released) return;
      released = true;
      const n = (inflight.get(key) ?? 1) - 1;
      if (n <= 0) inflight.delete(key);
      else inflight.set(key, n);
    },
  };
}

/** Prevent unbounded growth of the hit map. */
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
}, WINDOW_MS).unref?.();

export function jsonError(status: number, code: string, message: string, headers: Record<string, string> = {}) {
  return Response.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export const MAX_BODY_BYTES = 200_000;

export async function readJsonBody(req: Request): Promise<{ ok: true; body: unknown } | { ok: false; res: Response }> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return { ok: false, res: jsonError(415, "bad_request", "Expected a JSON request.") };
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BODY_BYTES) return { ok: false, res: jsonError(413, "too_large", "Request is too large.") };
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return { ok: false, res: jsonError(413, "too_large", "Request is too large.") };
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    return { ok: false, res: jsonError(400, "bad_request", "Malformed JSON.") };
  }
}
