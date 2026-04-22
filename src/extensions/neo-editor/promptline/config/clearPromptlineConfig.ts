import { setPromptlineConfig } from "./state.js";

/**
 * Clears the cached promptline config for the current session.
 */
export function clearPromptlineConfig(): void {
  setPromptlineConfig(undefined);
}
