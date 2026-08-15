import { visibleWidth } from "@earendil-works/pi-tui";
import type { FeatureStatusRow } from "../model/types";

/**
 * Calculates the display width needed for the feature-name column.
 *
 * @param rows Feature-management rows to measure.
 * @returns Maximum visible feature-name width.
 */
export function getFeatureColumnWidth(rows: FeatureStatusRow[]): number {
	return rows.reduce(
		(width, row) => Math.max(width, visibleWidth(row.feature)),
		0,
	);
}
