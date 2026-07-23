import type { AdapterDefinition } from "../shared/types.js";

/**
 * Creates the built-in Discord adapter definition.
 *
 * @returns Discord adapter metadata.
 */
export function createDiscordAdapterDefinition(): AdapterDefinition {
  return {
    id: "discord",
    label: "Discord",
    stage: "planned",
  };
}
