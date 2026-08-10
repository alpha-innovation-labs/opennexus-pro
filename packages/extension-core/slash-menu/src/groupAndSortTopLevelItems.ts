import { getTopLevelMenuGroupRank } from "./getTopLevelMenuGroupRank";
import { sortSlashMenuItemsByLabel } from "./sortSlashMenuItemsByLabel";
import type { SlashMenuLeaf, SlashMenuSection } from "./types";

/**
 * Groups top-level menu items by rank and sorts entries inside each group.
 *
 * @param items Top-level menu items.
 * @returns Grouped and sorted top-level menu items.
 */
export function groupAndSortTopLevelItems(items: Array<SlashMenuLeaf | SlashMenuSection>): Array<SlashMenuLeaf | SlashMenuSection> {
  const groups = new Map<string, Array<SlashMenuLeaf | SlashMenuSection>>();
  for (const item of items) {
    const groupLabel = item.groupLabel ?? "System";
    groups.set(groupLabel, [...(groups.get(groupLabel) ?? []), item]);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => getTopLevelMenuGroupRank(left) - getTopLevelMenuGroupRank(right) || left.localeCompare(right))
    .flatMap(([, groupItems]) => sortSlashMenuItemsByLabel(groupItems));
}
