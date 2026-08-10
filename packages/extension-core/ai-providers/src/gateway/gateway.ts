/**
 * AiGateway — a local LLM inference server that exposes an OpenAI-compatible API.
 *
 * Each gateway represents a single running inference server (Ollama, vLLM,
 * LM Studio, etc.).  The class encapsulates:
 *
 * - **exists()**  — probes `/v1/models` (or `/models` if baseUrl already ends with `/v1`) to confirm the gateway is alive
 * - **getModels()**  — reads from cache only (never fetches live)
 * - **refreshModels()**  — fetches fresh models, writes cache, returns them
 * - **registerProvider()**  — registers with Pi (sync, fire-and-forget warm)
 */
import type { ExtensionAPI, ProviderConfigInput } from "@earendil-works/pi-coding-agent";
import {
  defaultPort,
  baseUrlFromPort,
  type GatewayProbeResult,
  type GatewayOptions,
} from "./types.js";
import { probeGateway } from "./probe.js";
import { fetchModelsFromGateway } from "./model-discovery.js";
import { getModels, refreshModels } from "./cache.js";
import { registerProvider as registerWithPi } from "./provider-registration.js";
import { getModelCachePath, readProviderStateCache } from "../cache/index.js";

/**
 * A local LLM inference server that exposes an OpenAI-compatible API.
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

  constructor(options: GatewayOptions) {
    this.providerId = options.providerId;
    this.name = options.name;
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey ?? "";
    this.api = options.api ?? "openai-completions";
    this.apiPath = options.apiPath ?? "";
  }

  /** Returns the default port for this provider, or undefined. */
  static defaultPort(providerId: string): number | undefined {
    return defaultPort(providerId);
  }

  /** Returns a base URL constructed from a default port. */
  static baseUrlFromPort(providerId: string, port?: number): string {
    return baseUrlFromPort(providerId, port);
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
    return probeGateway(this.baseUrl, this.apiKey, this.providerId);
  }

  /**
   * Returns the cached models for this gateway, or an empty array if
   * no cache entry exists.  This function never makes network calls.
   *
   * Use `refreshModels()` to force a live fetch.
   */
  async getModels(): Promise<
    NonNullable<ProviderConfigInput["models"]>
  > {
    return getModels(this.providerId);
  }

  /**
   * Registers this gateway with Pi so it appears in the model picker.
   *
   * Registers with the provided models list (or empty array for normal
   * startup).
   *
   * @param pi Pi extension API.
   * @param modelsOverride Optional explicit model list. When provided,
   *   this list is used instead of `[]` for the initial registration.
   *   Used by --list-models to surface cached models.
   */
  registerProvider(pi: ExtensionAPI, modelsOverride?: NonNullable<ProviderConfigInput["models"]>): void {
    registerWithPi(
      pi,
      this.providerId,
      this.name,
      this.baseUrl,
      this.apiKey,
      this.api,
      this.apiPath,
      modelsOverride,
      async (context) => this.refreshModels(context),
    );
  }

  /**
   * On-demand refresh: fetches fresh models, updates cache, and returns
   * the new model list.  Called by the `refreshModels` callback that Pi
   * invokes when the user explicitly requests a refresh.
   */
  async refreshModels(_context: unknown): Promise<
    NonNullable<ProviderConfigInput["models"]>
  > {
    return refreshModels(this.providerId, this.baseUrl, this.apiKey);
  }
}
