import type { ContextUsageCategory } from "./types";

const CELLS_PER_ROW = 5;
const HEADER_ROWS = 1;

/**
 * Calculates the marker-cell count needed to cover the category list area.
 *
 * @param categories Context usage categories.
 * @returns Total meter cells across header and category rows.
 */
export function getContextUsageMeterCellCount(
	categories: readonly ContextUsageCategory[],
): number {
	return Math.max(
		CELLS_PER_ROW,
		(categories.length + HEADER_ROWS) * CELLS_PER_ROW,
	);
}

/**
 * Returns the fixed marker count shown on each meter row.
 *
 * @returns Cells per rendered row.
 */
export function getContextUsageMeterCellsPerRow(): number {
	return CELLS_PER_ROW;
}
