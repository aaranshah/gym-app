import { LIMITS } from "@/lib/engine/options";
import { DEFAULT_MODEL, isConfigured, isMockMode } from "@/lib/engine/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tells the UI whether the engine can run, without revealing any secret. */
export async function GET() {
  return Response.json(
    {
      configured: isConfigured(),
      mock: isMockMode(),
      model: isMockMode() ? "demo-engine" : process.env.HUMANISER_MODEL || DEFAULT_MODEL,
      limits: { maxChars: LIMITS.maxChars },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
