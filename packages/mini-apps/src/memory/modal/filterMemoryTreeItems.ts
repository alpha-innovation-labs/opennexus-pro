import type { MemoryTreeItem } from "../types/MemoryTreeItem.js";

/**
 * Filters memory tree rows by path and markdown content.
 *
 * @param rows Memory tree rows.
 * @param query Search query.
 * @returns Matching rows.
 */
export function filterMemoryTreeItems(rows: MemoryTreeItem[], query: string): MemoryTreeItem[] {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return rows;
	return rows.filter((row) => `${row.relativePath}\n${row.item?.content ?? ""}`.toLowerCase().includes(normalized));
}
