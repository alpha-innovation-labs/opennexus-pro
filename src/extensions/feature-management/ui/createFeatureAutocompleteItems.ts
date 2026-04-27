import type { AutocompleteItem } from "@mariozechner/pi-tui";
import type { FeatureStatusRow } from "../model/types.js";

/**
 * Converts feature status rows into selectable modal items.
 *
 * @param rows Feature status rows.
 * @returns Autocomplete-compatible modal items.
 */
export function createFeatureAutocompleteItems(rows: FeatureStatusRow[]): AutocompleteItem[] {
	return rows.map((row, index) => ({
		label: `${row.feature} (${row.extensionId})`,
		value: String(index),
		description: `${row.status} · ${row.channel}`,
	}));
}
