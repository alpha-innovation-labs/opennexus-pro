/**
 * Registers a gateway with Pi so it appears in the model picker.
 *
 * Registers with the provided models list (or empty array for normal
 * startup).  Idempotent — calling twice with the same provider has no
 * additional effect.
 *
 * @param pi — Pi extension API.
 * @param providerId — The gateway's provider identifier.
 * @param name — Display name shown in the UI.
 * @param baseUrl — Base URL of the inference server.
 * @param apiKey — Optional API key.
 * @param api — API compat type (defaults to "openai-completions").
 * @param apiPath — Optional path prefix for API endpoints.
 * @param modelsOverride — Optional explicit model list. When provided,
 *   this list is used instead of `[]` for the initial registration.
 *   Used by --list-models to surface cached models.
 * @param refreshModelsCallback — Function to call when the user
 *   explicitly requests a model refresh.
 */
import type { ExtensionAPI, ProviderConfigInput } from "@earendil-works/pi-coding-agent";

let _registered = false;

/**
 * Registers this gateway with Pi so it appears in the model picker.
 *
 * @param pi — Pi extension API.
 * @param providerId — The gateway's provider identifier.
 * @param name — Display name shown in the UI.
 * @param baseUrl — Base URL of the inference server.
 * @param apiKey — Optional API key.
 * @param api — API compat type (defaults to "openai-completions").
 * @param apiPath — Optional path prefix for API endpoints.
 * @param modelsOverride — Optional explicit model list.
 * @param refreshModelsCallback — Function to call on user-initiated refresh.
 */
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
  if (_registered) {
    return;
  }
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
    refreshModels: async (context) => refreshModelsCallback?.(context),
  });
  _registered = true;
}

/**
 * Resets the registration flag.  Used for testing.
 */
export function resetRegistration(): void {
  _registered = false;
}
