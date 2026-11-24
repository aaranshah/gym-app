import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export interface TextRequest {
  system: string;
  user: string;
  effort: Effort;
  maxTokens: number;
  signal?: AbortSignal;
  onText?: (fullTextSoFar: string) => void;
}

export interface StructuredRequest<T> {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  effort: Effort;
  maxTokens: number;
  signal?: AbortSignal;
}

export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  readonly isMock: boolean;
  generateText(req: TextRequest): Promise<string>;
  generateStructured<T>(req: StructuredRequest<T>): Promise<T>;
}

export type EngineErrorCode =
  | "not_configured"
  | "auth"
  | "rate_limited"
  | "overloaded"
  | "timeout"
  | "refused"
  | "truncated"
  | "bad_request"
  | "aborted"
  | "invalid_output"
  | "unknown";

export class EngineError extends Error {
  constructor(
    public code: EngineErrorCode,
    message: string,
    public status = 500,
  ) {
    super(message);
    this.name = "EngineError";
  }
}

/* ------------------------------ Anthropic ------------------------------ */

const BETAS = ["server-side-fallback-2026-07-01"];

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  readonly isMock = false;
  private client: Anthropic;

  constructor(
    readonly model: string,
    private verifyModel: string,
    clientOptions: ConstructorParameters<typeof Anthropic>[0] = {},
  ) {
    this.client = new Anthropic({
      // Each stage is bounded; the SDK retries 408/409/429/5xx with backoff.
      timeout: 150_000,
      maxRetries: 2,
      ...clientOptions,
    });
  }

  async generateText(req: TextRequest): Promise<string> {
    try {
      const stream = this.client.beta.messages.stream(
        {
          model: this.model,
          max_tokens: req.maxTokens,
          betas: BETAS,
          // Server-side fallback: if a safety classifier declines (rare false
          // positives on benign text), the API retries on Anthropic's
          // recommended fallback model inside the same call.
          fallbacks: "default",
          thinking: { type: "adaptive" },
          output_config: { effort: req.effort },
          system: [{ type: "text", text: req.system, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: req.user }],
        },
        { signal: req.signal },
      );
      let text = "";
      stream.on("text", (delta) => {
        text += delta;
        req.onText?.(text);
      });
      const final = await stream.finalMessage();
      this.assertStop(final.stop_reason);
      const full = final.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      return full || text;
    } catch (err) {
      throw mapError(err);
    }
  }

  async generateStructured<T>(req: StructuredRequest<T>): Promise<T> {
    try {
      const res = await this.client.beta.messages.parse(
        {
          model: this.verifyModel,
          max_tokens: req.maxTokens,
          betas: BETAS,
          fallbacks: "default",
          thinking: { type: "adaptive" },
          output_config: { effort: req.effort, format: betaZodOutputFormat(req.schema) },
          system: [{ type: "text", text: req.system, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: req.user }],
        },
        { signal: req.signal },
      );
      this.assertStop(res.stop_reason);
      if (res.parsed_output == null) throw new EngineError("invalid_output", "The model returned an unreadable response.");
      return res.parsed_output as T;
    } catch (err) {
      throw mapError(err);
    }
  }

  private assertStop(stop: string | null) {
    if (stop === "refusal")
      throw new EngineError("refused", "The AI model declined to process this text. Try rephrasing or removing sensitive content.", 422);
    if (stop === "max_tokens")
      throw new EngineError("truncated", "The response was cut off because the text is too long. Try a shorter passage.", 422);
  }
}

function mapError(err: unknown): EngineError {
  if (err instanceof EngineError) return err;
  if (err instanceof Anthropic.APIUserAbortError) return new EngineError("aborted", "Request cancelled.", 499);
  if (err instanceof Anthropic.APIConnectionTimeoutError)
    return new EngineError("timeout", "The AI provider took too long to respond. Please try again.", 504);
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError)
    return new EngineError("auth", "The server's AI API key was rejected. Check ANTHROPIC_API_KEY.", 502);
  if (err instanceof Anthropic.RateLimitError)
    return new EngineError("rate_limited", "The AI provider is rate-limiting requests. Please wait a moment and retry.", 429);
  if (err instanceof Anthropic.BadRequestError)
    return new EngineError("bad_request", "The AI provider rejected the request. Try a shorter or simpler text.", 400);
  if (err instanceof Anthropic.InternalServerError)
    return new EngineError("overloaded", "The AI provider is temporarily unavailable or overloaded. Please retry shortly.", 503);
  if (err instanceof Anthropic.APIConnectionError)
    return new EngineError("overloaded", "Could not reach the AI provider. Check the server's network connection.", 503);
  if (err instanceof Anthropic.APIError)
    return new EngineError("unknown", `The AI provider returned an error (${err.status ?? "unknown"}).`, 502);
  if (err instanceof Error && err.name === "AbortError") return new EngineError("aborted", "Request cancelled.", 499);
  return new EngineError("unknown", "Something went wrong while processing the text.");
}

/* ------------------------------ configuration ------------------------------ */

export const DEFAULT_MODEL = "claude-opus-5-5";

export function isMockMode(): boolean {
  return process.env.HUMANISER_MOCK === "1";
}

export function isConfigured(): boolean {
  return isMockMode() || Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let cached: LLMProvider | null = null;

export async function getProvider(): Promise<LLMProvider> {
  if (cached) return cached;
  if (isMockMode()) {
    const { MockProvider } = await import("./mockProvider");
    cached = new MockProvider();
    return cached;
  }
  if (!isConfigured()) {
    throw new EngineError(
      "not_configured",
      "No AI provider is configured. Set ANTHROPIC_API_KEY in .env.local and restart the server.",
      503,
    );
  }
  const model = process.env.HUMANISER_MODEL || DEFAULT_MODEL;
  cached = new AnthropicProvider(model, process.env.HUMANISER_VERIFY_MODEL || model);
  return cached;
}
