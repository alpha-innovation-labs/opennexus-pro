import type { AutocompleteItem } from "@earendil-works/pi-tui";
import type { ManagedExtensionRow } from "../model/types.js";
import { formatManagedExtensionRow } from "./formatManagedExtensionRow.js";
import { getManagedExtensionColumnWidth } from "./getManagedExtensionColumnWidth.js";
import { getManagedExtensionGroupLabel } from "./getManagedExtensionGroupLabel.js";

/**
 * Creates autocomplete items for managed extension rows.
 *
 * @param rows Rows to render.
 * @param theme Active UI theme.
 * @returns Selectable modal items.
 */
export function createManagedExtensionItems(
	rows: ManagedExtensionRow[],
	theme: { fg(color: string, value: string): string },
): AutocompleteItem[] {
	const extensionColumnWidth = getManagedExtensionColumnWidth(rows);
	return rows.map((row) => ({
		groupLabel: getManagedExtensionGroupLabel(row.kind),
		label: formatManagedExtensionRow(row, extensionColumnWidth, theme).trimEnd(),
		value: row.id,
		preserveLabelWhitespace: true,
	}));
}
