import { setPromptlineConfig } from "./state";

/**
 * Clears the cached promptline config for the current session.
 */
export function clearPromptlineConfig(): void {
	setPromptlineConfig(undefined);
}
