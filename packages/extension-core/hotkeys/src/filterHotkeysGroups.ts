import { matchesHotkeysEntry } from "./matchesHotkeysEntry";
import type { HotkeysGroup } from "./types";

/**
 * Filters hotkeys groups by label or key text.
 *
 * @param groups Groups to filter.
 * @param query User filter query.
 * @returns Groups with only matching entries.
 */
export function filterHotkeysGroups(
	groups: HotkeysGroup[],
	query: string,
): HotkeysGroup[] {
	return groups
		.map((group) => ({
			...group,
			shortcuts: group.shortcuts.filter((entry) =>
				matchesHotkeysEntry(entry, query),
			),
		}))
		.filter((group) => group.shortcuts.length > 0);
}
