import type { SlashMenuLeaf } from "./types";

/**
 * Builds right-pane preview text for one leaf entry.
 *
 * @param leaf Selected leaf.
 * @returns Preview lines.
 */
export function createLeafPreviewLines(leaf: SlashMenuLeaf): string[] {
  return [leaf.label, "", leaf.description];
}
