import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readProviderConfig } from "./config/index.js";
import { getModelCachePath, readModelCache, type ModelCache } from "./cache/index.js";
import { getGateways } from "./gateways/getGateways.js";

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
 * New gateways are discovered automatically — add a port and name to
 * `default-ports.ts` and `PROVIDER_NAMES` in `createGateway.ts`.
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

  // Build gateways from user config (or fall back to hardcoded defaults).
  const providerConfig = readProviderConfig();
  const gateways = getGateways(providerConfig);

  // Register all gateways (fire-and-forget, never awaited).
  if (typeof pi.registerProvider === "function") {
    for (const gw of gateways) {
      const models = cache[gw.providerId] ?? [];
      gw.registerProvider(pi, models);
    }
  }
}
