import { matchesWhichKeyEntry } from "./matchesWhichKeyEntry.js";
import type { WhichKeyGroup } from "./types.js";

/**
 * Filters which-key groups by label or key text.
 *
 * @param groups Groups to filter.
 * @param query User filter query.
 * @returns Groups with only matching entries.
 */
export function filterWhichKeyGroups(groups: WhichKeyGroup[], query: string): WhichKeyGroup[] {
  return groups
    .map((group) => ({
      ...group,
      shortcuts: group.shortcuts.filter((entry) => matchesWhichKeyEntry(entry, query)),
    }))
    .filter((group) => group.shortcuts.length > 0);
}
