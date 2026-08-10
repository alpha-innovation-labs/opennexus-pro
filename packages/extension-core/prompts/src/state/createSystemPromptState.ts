import type { SystemPromptState } from "./types";

/**
 * Creates in-memory session state for the custom system prompt override.
 *
 * @returns Mutable state helpers for reading, updating, and resetting the override.
 */
export function createSystemPromptState(): SystemPromptState {
	let override: string | undefined;

	return {
		getOverride: () => override,
		setOverride: (prompt: string) => {
			override = prompt;
		},
		reset: () => {
			override = undefined;
		},
	};
}
