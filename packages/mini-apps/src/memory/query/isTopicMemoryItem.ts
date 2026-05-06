import type { MemoryItem } from "../types/MemoryItem.js";

/**
 * Checks whether a memory item is a topic file.
 *
 * @param item Memory item to inspect.
 * @returns True when the item is a project topic file.
 */
export function isTopicMemoryItem(item: MemoryItem): boolean {
	const parts = item.relativePath.split("/");
	return parts.length === 2 && parts[1]?.endsWith(".md") === true;
}
