import { createDefaultPromptlineConfig } from "./createDefaultPromptlineConfig";
import { getPromptlineConfigState } from "./state";
import type { PromptlineConfig } from "./types";

/**
 * Returns the cached promptline config, falling back to defaults before startup loads complete.
 *
 * @returns Active promptline config.
 */
export function getPromptlineConfig(): PromptlineConfig {
  return getPromptlineConfigState() ?? createDefaultPromptlineConfig();
}
