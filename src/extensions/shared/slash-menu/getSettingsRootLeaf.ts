import type { SlashMenuLeaf } from "./types.js";

/**
 * Returns the synthetic root leaf for the settings branch.
 *
 * @returns Settings root leaf.
 */
export function getSettingsRootLeaf(): SlashMenuLeaf {
  return {
    kind: "command",
    label: "Settings",
    description: "Open Pi's built-in settings selector with the live runtime contract.",
    value: "settings",
  };
}
