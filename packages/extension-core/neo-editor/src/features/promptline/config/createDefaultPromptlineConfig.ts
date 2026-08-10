import type { PromptlineConfig } from "./types";

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
