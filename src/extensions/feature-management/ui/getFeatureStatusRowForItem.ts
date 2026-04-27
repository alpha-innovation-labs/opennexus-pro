import type { AutocompleteItem } from "@mariozechner/pi-tui";
import type { FeatureStatusRow } from "../model/types.js";

/**
 * Resolves the feature row attached to a selected modal item.
 *
 * @param rows Available feature rows.
 * @param item Selected modal item.
 * @returns Matching feature row, when present.
 */
export function getFeatureStatusRowForItem(
	rows: FeatureStatusRow[],
	item: AutocompleteItem | null,
): FeatureStatusRow | null {
	if (!item) return null;
	return rows[Number(item.value)] ?? null;
}
