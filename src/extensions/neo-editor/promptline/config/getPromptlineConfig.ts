import { createDefaultPromptlineConfig } from "./createDefaultPromptlineConfig.js";
import { getPromptlineConfigState } from "./state.js";
import type { PromptlineConfig } from "./types.js";

/**
 * Returns the cached promptline config, falling back to defaults before startup loads complete.
 *
 * @returns Active promptline config.
 */
export function getPromptlineConfig(): PromptlineConfig {
  return getPromptlineConfigState() ?? createDefaultPromptlineConfig();
}
