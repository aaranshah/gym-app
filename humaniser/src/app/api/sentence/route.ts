import { SentenceRequestSchema } from "@/lib/engine/options";
import { runSentenceRewrite } from "@/lib/engine/pipeline";
import { EngineError, getProvider } from "@/lib/engine/provider";
import { acquire, clientKey, jsonError, readJsonBody } from "@/lib/server/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const parsedBody = await readJsonBody(req);
  if (!parsedBody.ok) return parsedBody.res;
  const parsed = SentenceRequestSchema.safeParse(parsedBody.body);
  if (!parsed.success) return jsonError(400, "invalid_input", parsed.error.issues[0]?.message ?? "Invalid request.");

  const guard = acquire(clientKey(req));
  if (!guard.ok) return jsonError(guard.status, "rate_limited", guard.message);
  try {
    const provider = await getProvider();
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(110_000)]);
    const result = await runSentenceRewrite(provider, parsed.data, signal);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const e = err instanceof EngineError ? err : new EngineError("unknown", "Something went wrong while rewriting the sentence.");
    if (!(err instanceof EngineError)) console.error("[sentence] unexpected error:", err instanceof Error ? err.name : typeof err);
    return jsonError(e.status, e.code, e.message);
  } finally {
    guard.release();
  }
}
