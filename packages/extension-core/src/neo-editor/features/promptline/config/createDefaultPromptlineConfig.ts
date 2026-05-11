import type { PromptlineConfig } from "./types.js";

/**
 * Creates the default in-memory promptline config.
 *
 * @returns Empty trigger config plus default Neo settings.
 */
export function createDefaultPromptlineConfig(): PromptlineConfig {
  return {
    triggerConfig: { rules: [] },
    neoConfig: { clearEditorOnTriggerSubmit: true },
  };
}
