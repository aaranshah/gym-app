import { HumaniseRequestSchema } from "@/lib/engine/options";
import { runHumanise } from "@/lib/engine/pipeline";
import { EngineError, getProvider } from "@/lib/engine/provider";
import type { PipelineEvent } from "@/lib/engine/types";
import { acquire, clientKey, jsonError, readJsonBody } from "@/lib/server/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PIPELINE_DEADLINE_MS = 285_000;

export async function POST(req: Request) {
  const parsedBody = await readJsonBody(req);
  if (!parsedBody.ok) return parsedBody.res;

  const parsed = HumaniseRequestSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return jsonError(400, "invalid_input", parsed.error.issues[0]?.message ?? "Invalid request.");
  }
  if (parsed.data.text.trim().length < 20) {
    return jsonError(400, "invalid_input", "Please enter at least a sentence or two (20+ characters).");
  }
  if (parsed.data.settings.lengthMode === "target" && !parsed.data.settings.targetWords) {
    return jsonError(400, "invalid_input", "Enter a target word count.");
  }

  let provider;
  try {
    provider = await getProvider();
  } catch (err) {
    const e = err instanceof EngineError ? err : new EngineError("unknown", "Server misconfiguration.");
    return jsonError(e.status, e.code, e.message);
  }

  const guard = acquire(clientKey(req));
  if (!guard.ok) {
    return jsonError(guard.status, "rate_limited", guard.message, guard.retryAfter ? { "Retry-After": String(guard.retryAfter) } : {});
  }

  const signal = AbortSignal.any([req.signal, AbortSignal.timeout(PIPELINE_DEADLINE_MS)]);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: PipelineEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
        } catch {
          /* client went away */
        }
      };
      try {
        const result = await runHumanise(provider, parsed.data, send, signal);
        send({ type: "result", result });
      } catch (err) {
        let e: EngineError;
        if (err instanceof EngineError) e = err;
        else if (signal.aborted && !req.signal.aborted) e = new EngineError("timeout", "Processing took too long. Try a shorter text or a lighter edit.");
        else {
          // Log the failure type only — never the user's text.
          console.error("[humanise] unexpected error:", err instanceof Error ? err.name : typeof err);
          e = new EngineError("unknown", "Something went wrong while processing the text.");
        }
        if (e.code !== "aborted") send({ type: "error", code: e.code, message: e.message });
      } finally {
        guard.release();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      guard.release();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
