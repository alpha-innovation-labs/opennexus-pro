import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";

/**
 * Sorts slash-menu items alphabetically by their visible label.
 *
 * @param items Menu items to sort.
 * @returns Sorted copy of the menu items.
 */
export function sortSlashMenuItemsByLabel<T extends SlashMenuLeaf | SlashMenuSection>(items: T[]): T[] {
  return [...items].sort((left, right) => left.label.localeCompare(right.label, undefined, { sensitivity: "base" }));
}
