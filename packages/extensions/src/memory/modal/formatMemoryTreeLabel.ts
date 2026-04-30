import type { MemoryTreeItem } from "../types/MemoryTreeItem.js";

const DIRECTORY_ICON = "";
const FILE_ICON = "";
const REFERENCE_INDEX_ICON = "";
const RAW_REFERENCE_ICON = "󰯊";

/**
 * Formats one memory tree row with connector glyphs and file-type icon.
 *
 * @param row Tree row to format.
 * @param rows Full visible tree row list.
 * @param index Row index in the visible tree.
 * @returns File-tree style label.
 */
export function formatMemoryTreeLabel(row: MemoryTreeItem, rows: MemoryTreeItem[], index: number): string {
	const connector = getConnectorPrefix(row, rows, index);
	const icon = getMemoryTreeIcon(row);
	return `${connector}${icon} ${row.label}`;
}

/** Picks the display icon for one memory tree row. */
function getMemoryTreeIcon(row: MemoryTreeItem): string {
	if (row.kind === "directory") return DIRECTORY_ICON;
	if (row.relativePath.endsWith("/reference/references.md")) return REFERENCE_INDEX_ICON;
	return row.relativePath.includes("/reference/raw/") ? RAW_REFERENCE_ICON : FILE_ICON;
}

/** Builds the tree connector prefix for one row. */
function getConnectorPrefix(row: MemoryTreeItem, rows: MemoryTreeItem[], index: number): string {
	if (row.depth === 0) return "";
	const segments: string[] = [];
	for (let depth = 0; depth < row.depth; depth += 1) segments.push(hasLaterSiblingAtDepth(rows, index, depth) ? "│  " : "   ");
	segments.push(hasLaterSiblingAtDepth(rows, index, row.depth) ? "├─ " : "└─ ");
	return segments.join("");
}

/** Returns whether a row has a later sibling at a given depth. */
function hasLaterSiblingAtDepth(rows: MemoryTreeItem[], index: number, depth: number): boolean {
	for (let cursor = index + 1; cursor < rows.length; cursor += 1) {
		const candidate = rows[cursor];
		if (!candidate || candidate.depth < depth) return false;
		if (candidate.depth === depth) return true;
	}
	return false;
}
