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

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getModels } from "../gateway/cache";

type ProviderConfigInput = {
	models?: Array<Record<string, unknown>>;
};

export function registerProvider(
	pi: ExtensionAPI,
	providerId: string,
	name: string,
	baseUrl: string,
	apiKey?: string,
	api?: string,
	apiPath?: string,
	modelsOverride?: NonNullable<ProviderConfigInput["models"]>,
	_refreshModelsCallback?: (
		context: unknown,
	) => Promise<NonNullable<ProviderConfigInput["models"]>>,
): void {
	if (typeof pi.registerProvider !== "function") {
		return;
	}

	const registerOptions: Record<string, unknown> = {
		name,
		baseUrl,
		api: api ?? "openai-completions",
		apiPath: apiPath ?? "",
		models: modelsOverride ?? [],
		refreshModels: async (_context: unknown) => {
			const models = await getModels(providerId);
			return models as unknown as Record<string, unknown>[];
		},
	};
	// Local providers (Ollama, LM Studio) do not require an API key.
	// A dummy key is sent so Pi treats them as authenticated and
	// includes them in `--list-models` output.
	const key = apiKey && apiKey.trim() !== "" ? apiKey : "local";
	registerOptions.apiKey = key;
	(pi.registerProvider as (id: string, opts: Record<string, unknown>) => void)(
		providerId,
		registerOptions,
	);
}

/**
 * No-op — singleton guard removed.
 */
export function resetRegistration(): void {
	// No-op — singleton guard removed.
}
