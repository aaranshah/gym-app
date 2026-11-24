/**
 * Exercises the real AnthropicProvider (the production code path) against a
 * fake `fetch`, so the request shape, streaming assembly, structured-output
 * parsing and error mapping are verified without network access or a key.
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AnthropicProvider, EngineError } from "@/lib/engine/provider";

type Captured = { url: string; headers: Record<string, string>; body: Record<string, unknown> };

function sse(events: [string, unknown][]): string {
  return events.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join("");
}

function streamResponse(text: string, stopReason = "end_turn"): Response {
  const msg = { id: "msg_1", type: "message", role: "assistant", model: "claude-opus-5-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 0 } };
  const chunks = text.match(/[\s\S]{1,7}/g) ?? [];
  const body = sse([
    ["message_start", { type: "message_start", message: msg }],
    ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }],
    ...chunks.map((c) => ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: c } }] as [string, unknown]),
    ["content_block_stop", { type: "content_block_stop", index: 0 }],
    ["message_delta", { type: "message_delta", delta: { stop_reason: stopReason, stop_sequence: null }, usage: { output_tokens: 20 } }],
    ["message_stop", { type: "message_stop" }],
  ]);
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}

function jsonResponse(json: unknown, status = 200): Response {
  return new Response(JSON.stringify(json), { status, headers: { "content-type": "application/json" } });
}

function makeProvider(responder: (c: Captured) => Response) {
  const calls: Captured[] = [];
  const fakeFetch = async (url: string | URL | Request, init?: RequestInit) => {
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((v, k) => (headers[k] = v));
    const c = { url: String(url), headers, body: JSON.parse(String(init?.body ?? "{}")) };
    calls.push(c);
    return responder(c);
  };
  const p = new AnthropicProvider("claude-opus-5-5", "claude-opus-5-5", {
    apiKey: "test-key",
    fetch: fakeFetch as unknown as typeof fetch,
    maxRetries: 0,
  });
  return { p, calls };
}

describe("AnthropicProvider (fake transport)", () => {
  it("streams text with the expected request shape", async () => {
    const { p, calls } = makeProvider(() => streamResponse("<rewrite>\nHello there, world.\n</rewrite>"));
    const seen: string[] = [];
    const out = await p.generateText({ system: "SYS", user: "USER", effort: "medium", maxTokens: 64000, onText: (t) => seen.push(t) });
    expect(out).toBe("<rewrite>\nHello there, world.\n</rewrite>");
    expect(seen.length).toBeGreaterThan(2);
    const c = calls[0];
    expect(c.url).toContain("/v1/messages");
    expect(c.headers["anthropic-beta"]).toContain("server-side-fallback-2026-07-01");
    // The SDK sends the key as x-api-key or Authorization: Bearer depending on version.
    expect([c.headers["x-api-key"], c.headers["authorization"]]).toContain(c.headers["x-api-key"] ? "test-key" : "Bearer test-key");
    expect(c.body).toMatchObject({
      model: "claude-opus-5-5",
      max_tokens: 64000,
      stream: true,
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: [{ type: "text", text: "SYS", cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: "USER" }],
    });
    // Removed / rejected parameters on this model must never be sent.
    expect(c.body).not.toHaveProperty("temperature");
    expect(JSON.stringify(c.body)).not.toContain("budget_tokens");
  });

  it("parses structured output", async () => {
    const schema = z.object({ verdict: z.string(), score: z.number() });
    const { p, calls } = makeProvider(() =>
      jsonResponse({
        id: "msg_2", type: "message", role: "assistant", model: "claude-opus-5-5",
        content: [{ type: "text", text: JSON.stringify({ verdict: "ok", score: 4 }) }],
        stop_reason: "end_turn", stop_sequence: null, usage: { input_tokens: 5, output_tokens: 5 },
      }),
    );
    const out = await p.generateStructured({ system: "S", user: "U", schema, effort: "low", maxTokens: 8000 });
    expect(out).toEqual({ verdict: "ok", score: 4 });
    const fmt = (calls[0].body.output_config as { format: { type: string } }).format;
    expect(fmt.type).toBe("json_schema");
  });

  it("maps a refusal stop reason to a clear error", async () => {
    const { p } = makeProvider(() => streamResponse("", "refusal"));
    await expect(p.generateText({ system: "S", user: "U", effort: "low", maxTokens: 100 })).rejects.toMatchObject({ code: "refused" });
  });

  it("maps a max_tokens stop reason to 'truncated'", async () => {
    const { p } = makeProvider(() => streamResponse("<rewrite>partial", "max_tokens"));
    await expect(p.generateText({ system: "S", user: "U", effort: "low", maxTokens: 100 })).rejects.toMatchObject({ code: "truncated" });
  });

  it.each([
    [401, "auth"],
    [429, "rate_limited"],
    [400, "bad_request"],
    [529, "overloaded"],
    [500, "overloaded"],
  ])("maps HTTP %i to %s without leaking provider details", async (status, code) => {
    const { p } = makeProvider(() => jsonResponse({ type: "error", error: { type: "x", message: "secret internal detail" } }, status));
    const err = await p.generateText({ system: "S", user: "U", effort: "low", maxTokens: 100 }).catch((e) => e);
    expect(err).toBeInstanceOf(EngineError);
    expect(err.code).toBe(code);
    expect(err.message).not.toContain("secret internal detail");
  });
});
