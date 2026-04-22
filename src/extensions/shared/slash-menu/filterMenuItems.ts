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
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return items;

  return items
    .map((item, index) => ({ item, index, score: scoreItem(item, normalizedQuery) }))
    .filter((entry) => entry.score < Number.POSITIVE_INFINITY)
    .sort((left, right) => left.score - right.score || left.index - right.index)
    .map((entry) => entry.item);
}

/**
 * Scores one slash menu item for query ordering.
 *
 * @param item Candidate item.
 * @param query Normalized query.
 * @returns Lower is better. Infinity means no match.
 */
function scoreItem(item: SlashMenuLeaf | SlashMenuSection, query: string): number {
  const label = item.label.toLowerCase();
  const value = item.value.toLowerCase();
  const description = item.description.toLowerCase();
  const haystack = `${label} ${description} ${value}`;

  if (!haystack.includes(query)) return Number.POSITIVE_INFINITY;
  if (label === `/${query}` || label === query || value === query) return 0;
  if (label.startsWith(`/${query}`) || label.startsWith(query) || value.startsWith(query)) return 1;
  if (label.includes(query) || value.includes(query)) return 2;
  if (description.startsWith(query)) return 3;
  return 4;
}
