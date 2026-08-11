import type { PromptlineConfig } from "./types";

let promptlineConfig: PromptlineConfig | undefined;

/**
 * Stores the active promptline config for the current session.
 *
 * @param value Promptline config to cache.
 */
export function setPromptlineConfig(value: PromptlineConfig | undefined): void {
	promptlineConfig = value;
}

/**
 * Returns the cached promptline config for the current session.
 *
 * @returns Cached promptline config.
 */
export function getPromptlineConfigState(): PromptlineConfig | undefined {
	return promptlineConfig;
}
