import type { AutocompleteItem } from "@earendil-works/pi-tui";
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
	return rows.find((row) => row.extensionId === item.value) ?? null;
}

/**
 * Returns whether a feature id belongs to a mini-app.
 *
 * @param extensionId Extension/feature id.
 * @returns True when the feature is a mini-app.
 */
export function isMiniApp(extensionId: string): boolean {
	return extensionId === "tetris";
}
