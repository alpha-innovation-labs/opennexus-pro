import type { ExtensionAPI, ProviderConfigInput } from "@earendil-works/pi-coding-agent";
import { DEFAULT_PORTS } from "./constants/default-ports.js";
import {
  getModelCachePath,
  readModelCache,
  writeModelCache,
  type ModelCache,
} from "./cache/index.js";

const UNKNOWN_PROVIDER = "unknown";

/**
 * A local LLM inference server that exposes an OpenAI-compatible API.
 *
 * Each gateway represents a single running inference server (Ollama, vLLM,
 * LM Studio, etc.).  The class encapsulates:
 *
 * - **exists()**  — probes `/v1/models` (or `/models` if baseUrl already ends with `/v1`) to confirm the gateway is alive
 * - **getModels()**  — returns cached models synchronously (never blocks)
 * - **refreshModels()**  — fetches fresh models, writes cache, returns them
 * - **registerProvider()**  — registers with Pi (sync, fire-and-forget warm)
 */
export class AiGateway {
  /** Unique provider identifier used by Pi (e.g. "ollama", "vllm"). */
  readonly providerId: string;

  /** Display name shown in the UI. */
  readonly name: string;

  /** Base URL of the inference server (e.g. `http://localhost:11434`).
   *  Some back-ends (Ollama) embed the path in baseUrl (`…/v1`). */
  readonly baseUrl: string;

  /** API key sent with every request. */
  readonly apiKey: string;

  /** API compat type passed to Pi (defaults to "openai-completions"). */
  readonly api: string;

  /** Optional path prefix for API endpoints (e.g. "/v1" for Ollama). *
   *  NOTE: Not all back-ends honor this field. When unsure, embed the path
   *  directly in `baseUrl` (e.g. `http://localhost:11434/v1`).
   *  Defaults to "" for backward compatibility. */
  readonly apiPath: string;

  /** Whether this gateway has been registered with Pi. */
  private _registered = false;

  /** Cache of models returned by the last successful warm (may be null). */
  private _cachedModels: NonNullable<ProviderConfigInput["models"]> | null =
    null;

  /** Deduplicates concurrent `_warmCache()` calls so only one write
   *  is in flight at a time. */
  private _cacheWritePromise: Promise<void> | null = null;

  constructor(options: {
    providerId: string;
    name: string;
    baseUrl: string;
    apiKey?: string;
    api?: string;
    apiPath?: string;
  }) {
    this.providerId = options.providerId;
    this.name = options.name;
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey ?? "";
    this.api = options.api ?? "openai-completions";
    this.apiPath = options.apiPath ?? "";
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
   * The `/v1/models` suffix is appended unless `baseUrl` already ends with `/v1`.
   */
  async exists(): Promise<boolean> {
    try {
      const url = this.baseUrl.endsWith('/v1')
        ? `${this.baseUrl}/models`
        : `${this.baseUrl}/v1/models`;
      const res = await fetch(url, {
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
   * Returns cached models (sync).  Returns an empty array on cache miss.
   *
   * This is the fast path used at startup — it never blocks.
   */
  getModels(): NonNullable<ProviderConfigInput["models"]> {
    return this._cachedModels ?? [];
  }

  /**
   * Fetches models from the gateway and maps them to Pi's model format.
   *
   * Embedding models are filtered out — only LLMs are returned.
   *
   * Returns an empty array if the gateway is unreachable.
   * The `/v1/models` suffix is appended unless `baseUrl` already ends with `/v1`.
   */
  async fetchModels(): Promise<
    NonNullable<ProviderConfigInput["models"]>
  > {
    try {
      const url = this.baseUrl.endsWith('/v1')
        ? `${this.baseUrl}/models`
        : `${this.baseUrl}/v1/models`;
      const res = await fetch(url, {
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
   * Registers with an empty model list and starts a fire-and-forget
   * background warm so the first real models arrive asynchronously.
   */
  async registerProvider(pi: ExtensionAPI): Promise<void> {
    if (this._registered) {
      return;
    }
    if (typeof pi.registerProvider !== "function") {
      return;
    }

    pi.registerProvider(this.providerId, {
      name: this.name,
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      api: this.api,
      apiPath: this.apiPath,
      models: [],
      refreshModels: async (context) => this.refreshModels(context),
    });
    this._registered = true;

    // Fire-and-forget warm — errors are silently swallowed.
    this._warmCache();
  }

  /**
   * On-demand refresh: fetches fresh models, updates cache, and returns
   * the new model list.  Called by the `refreshModels` callback that Pi
   * invokes when the user explicitly requests a refresh.
   */
  async refreshModels(_context: unknown): Promise<
    NonNullable<ProviderConfigInput["models"]>
  > {
    const models = await this.fetchModels();
    await this._writeCache(models);
    this._cachedModels = models;
    return models;
  }

  /**
   * Background warm: reads the existing cache, fetches fresh models,
   * merges them into the cache file, and sets `_cachedModels` so the
   * next `getModels()` call returns the new data.
   *
   * Errors are silently swallowed — a failed warm is no worse than the
   * existing behaviour where the gateway registers with empty models.
   */
  private async _warmCache(): Promise<void> {
    try {
      const cachePath = getModelCachePath();
      const cache = await readModelCache(cachePath);

      const freshModels = await this.fetchModels();

      // Merge: this gateway's models replace any previous entry.
      cache[this.providerId] = freshModels;
      await writeModelCache(cachePath, cache);

      this._cachedModels = freshModels;
    } catch {
      // Silently ignore — first-run failure is harmless.
    }
  }

  /**
   * Writes a single gateway's model list into the cache file.
   *
   * Deduplicates concurrent writes via `_cacheWritePromise` so that
   * only one write is in flight at a time.  This is used by
   * `_warmCache()` and `refreshModels()`.
   */
  private async _writeCache(models: NonNullable<ProviderConfigInput["models"]>): Promise<void> {
    if (this._cacheWritePromise) {
      // Another write is already in flight — wait for it, then re-queue.
      await this._cacheWritePromise;
    }

    this._cacheWritePromise = (async () => {
      try {
        const cachePath = getModelCachePath();
        const cache = await readModelCache(cachePath);
        cache[this.providerId] = models;
        await writeModelCache(cachePath, cache);
      } finally {
        this._cacheWritePromise = null;
      }
    })();

    return this._cacheWritePromise;
  }

  private _authHeaders(): Record<string, string> {
    if (this.apiKey) {
      return { Authorization: `Bearer ${this.apiKey}` };
    }
    return {};
  }
}
