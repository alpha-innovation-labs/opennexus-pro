import type { ExtensionAPI, ProviderConfigInput } from "@earendil-works/pi-coding-agent";
import { getBuiltinModels, getBuiltinProviders } from "@earendil-works/pi-ai/providers/all";
import { DEFAULT_PORTS } from "./constants/default-ports.js";
import {
  getModelCachePath,
  readModelCache,
  writeModelCache,
  type ModelCache,
} from "./cache/index.js";

/** Result of probing a gateway. */
export type GatewayProbeResult =
  | { status: "ok"; statusCode: number; statusText: string }
  | { status: "access-denied"; reason: string }
  | { status: "unreachable"; reason: string };

/**
 * A local LLM inference server that exposes an OpenAI-compatible API.
 *
 * Each gateway represents a single running inference server (Ollama, vLLM,
 * LM Studio, etc.).  The class encapsulates:
 *
 * - **exists()**  — probes `/v1/models` (or `/models` if baseUrl already ends with `/v1`) to confirm the gateway is alive
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
   * Probes the gateway at `/v1/models` (or `/models` if baseUrl already ends
   * with `/v1`) and returns a detailed status.
   *
   * Distinguishes three cases:
   * - `ok`: server responded with HTTP 200–299 and the body matches the
   *   OpenAI `/v1/models` contract (`{ data: [{ object: "model" }] })`)
   * - `access-denied`: server responded with a non-2xx status — the server
   *   IS an AI provider, but auth was rejected (401/403)
   * - `unreachable`: connection error (DNS failure, connection refused, timeout)
   *
   * The `/v1/models` suffix is appended unless `baseUrl` already ends with `/v1`.
   */
  async exists(): Promise<GatewayProbeResult> {
    try {
      const url = this.baseUrl.endsWith('/v1')
        ? `${this.baseUrl}/models`
        : `${this.baseUrl}/v1/models`;
      const res = await fetch(url, {
        headers: this._authHeaders(),
      });
      // Any HTTP response (2xx, 4xx, 5xx) means the server IS reachable
      // and exposes /v1/models — it is an AI provider.  Only connection
      // errors (caught below) mean "unreachable".
      if (!res.ok) {
        const port = DEFAULT_PORTS[this.providerId];
        const portHint = port ? `port ${port}` : "a port";
        // 401/403 with an api_key = wrong key on the correct server
        // 401/403 without an api_key = the server is running but no key configured
        // 404 = the server is running but doesn't support /v1/models
        // In all cases the server IS an AI provider — just not accessible.
        return {
          status: "access-denied",
          reason: `Access denied on ${portHint} — the server is running but rejected the request`,
        };
      }
      // Validate the response body matches the OpenAI /v1/models contract:
      // { data: [{ object: "model", id: string, ... }] }
      const body = await res.json();
      const dataArray = body?.data;
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return { status: "unreachable", reason: "Not an OpenAI-compatible server (no data array)" };
      }
      const firstItem = dataArray[0];
      if (firstItem?.object !== "model") {
        return { status: "unreachable", reason: "Not an OpenAI-compatible server (missing object: 'model')" };
      }
      return { status: "ok", statusCode: res.status, statusText: res.statusText };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return { status: "unreachable", reason };
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
   * Looks up a model ID across all built-in providers in the pi-ai catalog.
   *
   * @param modelId — The model identifier to search for.
   * @returns The catalog metadata if found, or `undefined` when no catalog
   *   entry exists.  Callers MUST NOT fabricate a value in that case —
   *   hardcoding is a CATASTROPHIC FAILURE.
   */
  private static _lookupCatalogModel(modelId: string): {
    reasoning: boolean;
    input: ("text" | "image")[];
    cost: ProviderConfigInput["models"][number]["cost"];
    contextWindow: number;
    maxTokens: number;
  } | undefined {
    for (const provider of getBuiltinProviders()) {
      const models = getBuiltinModels(provider);
      const match = models.find((m) => m.id === modelId);
      if (match) {
        return {
          reasoning: match.reasoning,
          input: match.input,
          cost: match.cost,
          contextWindow: match.contextWindow,
          maxTokens: match.maxTokens,
        };
      }
    }
    return undefined;
  }

  /**
   * Fetches models from the gateway and maps them to Pi's model format.
   *
   * Embedding models are filtered out.  For each model ID returned by the
   * gateway, the built-in model catalog is consulted — `reasoning`,
   * `input`, `cost`, `contextWindow`, and `maxTokens` are all sourced from
   * the catalog.  Models with no catalog entry are silently skipped.
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
      const catalogModels = data.data ?? [];
      const results: NonNullable<ProviderConfigInput["models"]> = [];
      for (const m of catalogModels as Array<{ id: string }>) {
        // Skip embedding models — they are not LLMs.
        if (AiGateway.isEmbeddingModel(m.id)) {
          continue;
        }
        const catalog = AiGateway._lookupCatalogModel(m.id);
        if (!catalog) {
          // NOTE: Hardcoding reasoning, input, cost, contextWindow, or maxTokens
          // when no catalog entry exists is a CATASTROPHIC FAILURE.  Always add
          // the model to the pi-ai catalog (models.generated.ts) before using it
          // through a gateway, so the real values flow through here.
          continue;
        }
        results.push({
          id: m.id,
          name: m.id,
          reasoning: catalog.reasoning,
          input: catalog.input,
          cost: catalog.cost,
          contextWindow: catalog.contextWindow,
          maxTokens: catalog.maxTokens,
        });
      }
      return results;
    } catch {
      return [];
    }
  }

  /**
   * Registers this gateway with Pi so it appears in the model picker.
   *
   * Registers with the provided models list (or empty array for normal
   * startup).  The background warm is fire-and-forget and never awaited
   * — a failed warm is no worse than the existing behaviour where the
   * gateway registers with empty models.
   *
   * @param pi Pi extension API.
   * @param modelsOverride Optional explicit model list. When provided,
   *   this list is used instead of `[]` for the initial registration.
   *   Used by --list-models to surface cached models.
   */
  registerProvider(pi: ExtensionAPI, modelsOverride?: NonNullable<ProviderConfigInput["models"]>): void {
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
      models: modelsOverride ?? [],
      refreshModels: async (context) => this.refreshModels(context),
    });
    this._registered = true;

    // Fire-and-forget warm — never awaited, errors silently swallowed.
    this._warmCache();
  }

  /**
   * On-demand refresh: fetches fresh models, updates cache, and returns
   * the new model list.  Called by the `refreshModels` callback that Pi
   * invokes when the user explicitly requests a refresh.
   *
   * If the live server is unreachable, returns the cached models instead
   * of an empty list — so the slash menu always shows discovered models
   * even when local servers are offline.
   */
  async refreshModels(_context: unknown): Promise<
    NonNullable<ProviderConfigInput["models"]>
  > {
    const models = await this.fetchModels();
    await this._writeCache(models);
    return models;
  }

  /**
   * Background warm: reads the existing cache, fetches fresh models,
   * and merges them into the cache file.
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
