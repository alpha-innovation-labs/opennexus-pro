/**
 * Registers a gateway with Pi so it appears in the model picker.
 *
 * Registers with the cached models list (from
 * `available_models.json`) during startup.  Called once per gateway.
 *
 * @param pi — Pi extension API.
 * @param providerId — The gateway's provider identifier.
 * @param name — Display name shown in the UI.
 * @param baseUrl — Base URL of the inference server.
 * @param apiKey — Optional API key.
 * @param api — API compat type (defaults to "openai-completions").
 * @param apiPath — Optional path prefix for API endpoints.
 * @param modelsOverride — Cached model list for this gateway.
 * @param refreshModelsCallback — Function to call when the user
 *   explicitly requests a model refresh.
 */
import { getModels } from "../gateway/cache";
import type { ExtensionAPI, ProviderConfigInput } from "@earendil-works/pi-coding-agent";

export function registerProvider(
  pi: ExtensionAPI,
  providerId: string,
  name: string,
  baseUrl: string,
  apiKey?: string,
  api?: string,
  apiPath?: string,
  modelsOverride?: NonNullable<ProviderConfigInput["models"]>,
  refreshModelsCallback?: (context: unknown) => Promise<NonNullable<ProviderConfigInput["models"]>>,
): void {
  if (typeof pi.registerProvider !== "function") {
    return;
  }

  pi.registerProvider(providerId, {
    name,
    baseUrl,
    apiKey: apiKey ?? "",
    api: api ?? "openai-completions",
    apiPath: apiPath ?? "",
    models: modelsOverride ?? [],
    // When Pi calls this (e.g. /list-models opens the model picker),
    // return cached models only — no network call.  Live fetch only
    // happens via the CLI refresh command (gw.refreshModels()).
    refreshModels: async () => getModels(providerId),
  });
}

/**
 * No-op — singleton guard removed.
 */
export function resetRegistration(): void {
  // No-op — singleton guard removed.
}
