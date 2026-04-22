import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";
import { createCommandLeaves } from "./createCommandLeaves.js";

/**
 * Builds top-level slash menu items from registered commands plus settings.
 *
 * @returns Top-level slash menu items.
 */
export function createTopLevelItems(): Array<SlashMenuLeaf | SlashMenuSection> {
  return [
    ...createCommandLeaves(),
    {
      label: "Settings",
      description: "Toggle settings and open nested configuration.",
      value: "settings",
    },
  ];
}
