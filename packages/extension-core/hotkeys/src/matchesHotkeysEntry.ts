import type { HotkeysEntry } from "./types";

/**
 * Returns whether one hotkeys entry matches a filter query.
 *
 * @param entry Entry to test.
 * @param query User filter query.
 * @returns True when label or keys include the query.
 */
export function matchesHotkeysEntry(
	entry: HotkeysEntry,
	query: string,
): boolean {
	const normalized = query.trim().toLowerCase();
	const compact = normalized.replace(/\s+/g, "");
	if (!normalized) return true;
	return (
		entry.label.toLowerCase().includes(normalized) ||
		entry.keys.toLowerCase().includes(normalized) ||
		entry.keys.toLowerCase().replace(/\s+/g, "").includes(compact)
	);
}
