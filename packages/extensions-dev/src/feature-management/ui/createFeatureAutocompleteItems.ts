import type { AutocompleteItem } from "@earendil-works/pi-tui";
import type { FeatureStatusRow } from "../model/types.js";
import { formatFeatureManagementRow } from "./formatFeatureManagementRow.js";
import { getFeatureColumnWidth } from "./getFeatureColumnWidth.js";
import { sortFeatureStatusRows } from "./sortFeatureStatusRows.js";

/**
 * Converts feature status rows into selectable modal items.
 * Uses the original design: same row format (name + status),
 * grouped by section (Playground/Production), sorted alphabetically within.
 *
 * @param rows Feature status rows.
 * @param theme Theme color formatter.
 * @returns Autocomplete-compatible modal items.
 */
export function createFeatureAutocompleteItems(
	rows: FeatureStatusRow[],
	theme: { fg(color: string, value: string): string } = { fg: (_color, value) => value },
): AutocompleteItem[] {
	const sortedRows = sortFeatureStatusRows(rows);
	const featureColumnWidth = getFeatureColumnWidth(sortedRows);
	return sortedRows.map((row) => ({
		groupLabel: row.group,
		label: formatFeatureManagementRow(row, theme).trimEnd(),
		value: row.extensionId,
		preserveLabelWhitespace: true,
	}));
}
