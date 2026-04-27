import type { SlashMenuLeaf } from "../types.js";

/**
 * Resolves the user conversation toggled by a selected tree leaf.
 *
 * @param leaf Selected tree leaf.
 * @returns User entry id to toggle, when available.
 */
export function getTreeToggleUserId(leaf: SlashMenuLeaf | undefined): string | undefined {
  if (!leaf) return undefined;
  if (leaf.treeRole === "user") return leaf.value;
  return leaf.treeParentUserId;
}
