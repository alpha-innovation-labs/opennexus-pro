import type { ExtensionAPI, ProviderConfigInput } from "@earendil-works/pi-coding-agent";
import { DEFAULT_PORTS } from "./constants/default-ports.js";

const UNKNOWN_PROVIDER = "unknown";

/**
 * A local LLM inference server that exposes an OpenAI-compatible API.
 *
 * Each gateway represents a single running inference server (Ollama, vLLM,
 * LM Studio, etc.).  The class encapsulates:
 *
 * - **exists()**  — probes `/v1/models` to confirm the gateway is alive
 * - **getModels()**  — fetches and maps the model list from `/v1/models`
 * - **registerProvider()**  — registers the gateway with Pi via `pi.registerProvider`
 */
export class AiGateway {
  /** Unique provider identifier used by Pi (e.g. "ollama", "vllm"). */
  readonly providerId: string;

  /** Display name shown in the UI. */
  readonly name: string;

  /** Base URL of the inference server (e.g. `http://localhost:11434`). */
  readonly baseUrl: string;

  /** API key sent with every request. */
  readonly apiKey: string;

  /** API compat type passed to Pi (defaults to "openai-completions"). */
  readonly api: string;

  /** Whether this gateway has been registered with Pi. */
  private _registered = false;

  constructor(options: {
    providerId: string;
    name: string;
    baseUrl: string;
    apiKey?: string;
    api?: string;
  }) {
    this.providerId = options.providerId;
    this.name = options.name;
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey ?? "";
    this.api = options.api ?? "openai-completions";
  }

  /** Returns the default port for this provider, or undefined. */
  static defaultPort(providerId: string): number | undefined {
    return DEFAULT_PORTS[providerId];
  }

  /** Returns a base URL constructed from a default port. */
  static baseUrlFromPort(providerId: string, port?: number): string {
    const p = port ?? DEFAULT_PORTS[providerId];
    if (!p) {
      throw new Error(`Unknown provider "${providerId}" — no default port.`);
    }
    return `http://localhost:${p}`;
  }

  /**
   * Probes the gateway to confirm it is alive and serving `/v1/models`.
   *
   * Returns `true` if the endpoint responds with HTTP 200, `false` otherwise.
   */
  async exists(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/models`, {
        headers: this._authHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Returns true if a model ID looks like an embedding model.
   */
  private static isEmbeddingModel(id: string): boolean {
    const lower = id.toLowerCase();
    return (
      lower.includes("embed") ||
      lower.includes("text-embedding") ||
      lower.includes("clip") ||
      lower.includes("bge") ||
      lower.includes("mxbai") ||
      lower.includes("nomic-embed")
    );
  }

  /**
   * Fetches models from the gateway and maps them to Pi's model format.
   *
   * Embedding models are filtered out — only LLMs are returned.
   *
   * Returns an empty array if the gateway is unreachable.
   */
  async getModels(): Promise<
    NonNullable<ProviderConfigInput["models"]>
  > {
    try {
      const res = await fetch(`${this.baseUrl}/v1/models`, {
        headers: this._authHeaders(),
      });
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return (data.data ?? [])
        .filter((m: { id: string }) => !AiGateway.isEmbeddingModel(m.id))
        .map((m: { id: string }) => ({
          id: m.id,
          name: m.id,
          reasoning: false,
          input: ["text"] as const,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
          contextWindow: 128_000,
          maxTokens: 8_192,
        }));
    } catch {
      return [];
    }
  }

  /**
   * Registers this gateway with Pi so it appears in the model picker.
   *
   * Fetches models at registration time so Pi does not fall back to its
   * built-in catalog.
   */
  async registerProvider(pi: ExtensionAPI): Promise<void> {
    if (this._registered) {
      return;
    }
    if (typeof pi.registerProvider !== "function") {
      return;
    }

    const models = await this.getModels();

    pi.registerProvider(this.providerId, {
      name: this.name,
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      api: this.api,
      models,
      refreshModels: async (context) => this.getModels(),
    });
    this._registered = true;
  }

  private _authHeaders(): Record<string, string> {
    if (this.apiKey) {
      return { Authorization: `Bearer ${this.apiKey}` };
    }
    return {};
  }
}
