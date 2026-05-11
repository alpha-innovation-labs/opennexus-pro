import type { AutocompleteItem } from "@earendil-works/pi-tui";
import type { FeatureStatusRow, FeatureManagementControl } from "../model/types.js";
import { formatFeatureManagementRow } from "./formatFeatureManagementRow.js";
import { getFeatureColumnWidth } from "./getFeatureColumnWidth.js";
import { sortFeatureStatusRows } from "./sortFeatureStatusRows.js";

/**
 * Converts feature status rows into selectable modal items.
 *
 * @param rows Feature status rows.
 * @param activeControl Currently focused row control.
 * @param theme Theme color formatter.
 * @returns Autocomplete-compatible modal items.
 */
export function createFeatureAutocompleteItems(
	rows: FeatureStatusRow[],
	activeControl: FeatureManagementControl = "status",
	theme: { fg(color: string, value: string): string } = { fg: (_color, value) => value },
): AutocompleteItem[] {
	const sortedRows = sortFeatureStatusRows(rows);
	const featureColumnWidth = getFeatureColumnWidth(sortedRows);
	return sortedRows.map((row) => ({
		groupLabel: row.group,
		label: formatFeatureManagementRow(row, activeControl, featureColumnWidth, theme).trimEnd(),
		value: row.extensionId,
		preserveLabelWhitespace: true,
	}));
}
