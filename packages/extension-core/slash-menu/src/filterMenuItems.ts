import { createSearchTokens } from "./search/createSearchTokens.js";
import { doesSearchQueryMatch } from "./search/doesSearchQueryMatch.js";
import { normalizeSearchText } from "./search/normalizeSearchText.js";
import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";

/**
 * Filters and ranks slash menu items by the current query.
 *
 * @param items Candidate items.
 * @param query Current search query.
 * @returns Filtered items.
 */
export function filterMenuItems(
  items: Array<SlashMenuLeaf | SlashMenuSection>,
  query: string,
): Array<SlashMenuLeaf | SlashMenuSection> {
  const tokens = createSearchTokens(query);
  if (tokens.length === 0) return items;

  const groupOrder = createGroupOrder(items);
  return items
    .map((item, index) => ({ item, index, score: scoreItem(item, tokens), groupIndex: getGroupIndex(item, groupOrder) }))
    .filter((entry) => entry.score < Number.POSITIVE_INFINITY)
    .sort((left, right) => left.groupIndex - right.groupIndex || left.score - right.score || left.index - right.index)
    .map((entry) => entry.item);
}

/**
 * Creates stable group ordering from the unfiltered menu order.
 *
 * @param items Candidate menu items.
 * @returns Group label to group index map.
 */
function createGroupOrder(items: Array<SlashMenuLeaf | SlashMenuSection>): Map<string, number> {
  const groupOrder = new Map<string, number>();
  for (const item of items) {
    const label = item.groupLabel?.trim();
    if (label && !groupOrder.has(label)) groupOrder.set(label, groupOrder.size);
  }
  return groupOrder;
}

/**
 * Reads a stable group index for an item.
 *
 * @param item Candidate menu item.
 * @param groupOrder Group label to group index map.
 * @returns Group index, or zero for ungrouped menus.
 */
function getGroupIndex(item: SlashMenuLeaf | SlashMenuSection, groupOrder: Map<string, number>): number {
  if (groupOrder.size === 0) return 0;
  return groupOrder.get(item.groupLabel?.trim() ?? "") ?? groupOrder.size;
}

/**
 * Scores one slash menu item for query ordering.
 *
 * @param item Candidate item.
 * @param tokens Normalized query tokens.
 * @returns Lower is better. Infinity means no match.
 */
function scoreItem(item: SlashMenuLeaf | SlashMenuSection, tokens: string[]): number {
  const label = normalizeSearchText(item.label);
  const value = normalizeSearchText(item.value);
  const query = tokens.join(" ");
  if (!doesSearchQueryMatch(item.label, item.value, tokens)) return Number.POSITIVE_INFINITY;
  if (label === query || value === query) return 0;
  if (label.startsWith(query) || value.startsWith(query)) return 1;
  if (label.includes(query) || value.includes(query)) return 2;
  return 3;
}
