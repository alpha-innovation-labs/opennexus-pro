import type { AdapterDefinition } from "../shared/types.js";

/**
 * Creates the built-in Telegram adapter definition.
 *
 * @returns Telegram adapter metadata.
 */
export function createTelegramAdapterDefinition(): AdapterDefinition {
  return {
    id: "telegram",
    label: "Telegram",
    stage: "polling",
  };
}
