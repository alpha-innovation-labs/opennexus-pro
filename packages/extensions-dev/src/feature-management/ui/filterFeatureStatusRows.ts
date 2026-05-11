import type { FeatureStatusRow } from "../model/types.js";

/**
 * Filters feature-management rows by typed feature text.
 *
 * @param rows Feature rows to filter.
 * @param query User-entered filter query.
 * @returns Rows whose feature id matches the query.
 */
export function filterFeatureStatusRows(rows: FeatureStatusRow[], query: string): FeatureStatusRow[] {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) return rows;
	return rows.filter((row) => row.feature.toLowerCase().includes(normalizedQuery));
}
