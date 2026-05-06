import type { SystemPromptState } from "./types.js";

/**
 * Resolves the prompt shown to the user from override state and the runtime default.
 *
 * @param state System prompt override state.
 * @param defaultPrompt Current runtime system prompt.
 * @returns Override prompt when set, otherwise the runtime default prompt.
 */
export function getEffectiveSystemPrompt(
	state: SystemPromptState,
	defaultPrompt: string,
): string {
	return state.getOverride() ?? defaultPrompt;
}
