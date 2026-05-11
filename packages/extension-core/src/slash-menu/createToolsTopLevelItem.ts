import type { SlashMenuSection } from "./types.js";

/**
 * Builds the top-level Tools resource menu item.
 *
 * @returns Tools section item.
 */
export function createToolsTopLevelItem(): SlashMenuSection {
  return {
    label: "tools",
    description: "Show available tools.",
    groupLabel: "Resources",
    value: "tools",
  };
}
