import type { MemoryTreeItem } from "../types/MemoryTreeItem.js";

const PROJECT_ICON = "";
const REFERENCE_FOLDER_ICON = "";
const REFERENCE_ICON = "󰯊";
const TOPIC_ICON = "";

/**
 * Formats one memory tree row with connector glyphs and icon.
 *
 * @param row Tree row to format.
 * @param rows Full visible tree row list.
 * @param index Row index in the visible tree.
 * @returns File-tree style label.
 */
export function formatMemoryTreeLabel(row: MemoryTreeItem, rows: MemoryTreeItem[], index: number): string {
	const connector = getConnectorPrefix(row, rows, index);
	return `${connector}${getMemoryTreeIcon(row)} ${row.label}`;
}

/** Picks the display icon for one memory tree row. */
function getMemoryTreeIcon(row: MemoryTreeItem): string {
	if (row.role === "project") return PROJECT_ICON;
	if (row.role === "references") return REFERENCE_FOLDER_ICON;
	if (row.role === "reference") return REFERENCE_ICON;
	return TOPIC_ICON;
}

/** Builds the tree connector prefix for one row. */
function getConnectorPrefix(row: MemoryTreeItem, rows: MemoryTreeItem[], index: number): string {
	if (row.depth === 0) return "";
	const segments: string[] = [];
	for (let depth = 1; depth < row.depth; depth += 1) segments.push(hasLaterSiblingAtDepth(rows, index, depth) ? "│  " : "   ");
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
