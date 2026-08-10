import type { FeatureStatusRow } from "../model/types";

/**
 * Builds the right-pane detail lines for a selected feature row.
 *
 * @param row Selected feature row.
 * @returns Human-readable feature details.
 */
export function buildFeatureDetailLines(row: FeatureStatusRow | null): string[] {
	if (!row) return ["No feature selected"];

	return [
		"Feature",
		row.feature,
		"",
		"Extension",
		row.extensionId,
		"",
		"Status",
		row.status,
	];
}
