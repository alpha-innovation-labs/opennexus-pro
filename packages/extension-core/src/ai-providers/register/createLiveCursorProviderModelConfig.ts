import type { ProviderModelConfig } from "@earendil-works/pi-coding-agent";
import type { CursorModel } from "pi-cursor-provider/proxy.js";

/**
 * Converts a Cursor endpoint model into a Pi provider model config.
 *
 * @param model Cursor model returned by the live GetUsableModels endpoint.
 * @returns Provider model config for Nexus' Cursor provider registration.
 */
export function createLiveCursorProviderModelConfig(model: CursorModel): ProviderModelConfig {
	return {
		id: model.id,
		name: model.name,
		api: "openai-completions",
		reasoning: model.reasoning,
		input: ["text"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: model.contextWindow,
		maxTokens: model.maxTokens,
		compat: {
			supportsDeveloperRole: false,
			maxTokensField: "max_tokens",
		},
	};
}
