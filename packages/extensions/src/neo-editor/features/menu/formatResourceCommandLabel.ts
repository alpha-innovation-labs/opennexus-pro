import type { SlashMenuLeaf } from "./types.js";

/**
 * Formats a resource command list label with local/global scope indicator.
 *
 * @param icon Row icon.
 * @param item Resource command leaf.
 * @returns Formatted label.
 */
export function formatResourceCommandLabel(icon: string, item: SlashMenuLeaf): string {
  const scope = item.sourceScope === "project" ? "" : item.sourceScope === "user" ? "" : "?";
  return `${icon} ${scope} ${item.label}`;
}
