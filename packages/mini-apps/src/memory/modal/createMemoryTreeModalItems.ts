import type { AutocompleteItem } from "@mariozechner/pi-tui";
import type { MemoryTreeItem } from "../types/MemoryTreeItem.js";
import { formatMemoryTreeLabel } from "./formatMemoryTreeLabel.js";

/**
 * Converts memory tree rows into modal items with tree connectors and icons.
 *
 * @param rows Memory tree rows.
 * @returns Modal items.
 */
export function createMemoryTreeModalItems(rows: MemoryTreeItem[]): AutocompleteItem[] {
	return rows.map((row, index) => ({ value: row.path, label: formatMemoryTreeLabel(row, rows, index), preserveLabelWhitespace: true }));
}
