import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { LiteLLmGateway } from "./gateways/litellm.js";
import { LmStudioGateway } from "./gateways/lm-studio.js";
import { LlamaCppGateway } from "./gateways/llama-cpp.js";
import { OllamaGateway } from "./gateways/ollama.js";
import { VllmGateway } from "./gateways/vllm.js";
import { getModelCachePath, readModelCache, type ModelCache } from "./cache/index.js";

const builtInPiOAuthProviderIds = new Set([
  "anthropic",
  "github-copilot",
  "google-gemini-cli",
  "google-antigravity",
  "openai-codex",
]);

/**
 * Unregisters all providers that Pi registers natively, pre-populates
 * local gateways from the model cache, and registers all local LLM
 * gateways so the slash menu discovers them.
 *
 * Cache is pre-loaded synchronously; a background warm refreshes from
 * live servers and updates the cache file.
 *
 * New gateways are discovered automatically — just create a file in the
 * gateways folder that extends `AiGateway` and add a new instance to the
 * array below.
 *
 * @param pi Pi extension API.
 * @returns A promise that resolves when providers are unregistered.
 */
export async function registerAiProvidersExtension(pi: ExtensionAPI): Promise<void> {
  // Remove from the model registry (used by the slash menu for configured providers)
  if (typeof pi.unregisterProvider === "function") {
    for (const id of builtInPiOAuthProviderIds) {
      pi.unregisterProvider(id);
    }
  }
  // Note: unregisterOAuthProvider no longer exists in @earendil-works/pi-ai/oauth
  // (the module only re-exports types).  The OAuth registry is handled upstream.

  // Pre-load cache so gateways start with cached models (sync, never blocks).
  const cache: ModelCache = await readModelCache(getModelCachePath());

  // Register all gateways (fire-and-forget, never awaited).
  if (typeof pi.registerProvider === "function") {
    const gateways = [
      new LiteLLmGateway(),
      new LmStudioGateway(),
      new LlamaCppGateway(),
      new OllamaGateway(),
      new VllmGateway(),
    ];
    for (const gw of gateways) {
      const models = cache[gw.providerId] ?? [];
      gw.registerProvider(pi, models);
    }
  }
}
