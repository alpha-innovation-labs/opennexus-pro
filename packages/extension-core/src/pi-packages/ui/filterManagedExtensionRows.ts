import type { PiPackagesTab, ManagedExtensionRow } from "../model/types.js";

/**
 * Filters extension rows by active tab and search text.
 *
 * @param rows All rows.
 * @param tab Active tab.
 * @param query Search query.
 * @returns Visible rows.
 */
export function filterManagedExtensionRows(
	rows: ManagedExtensionRow[],
	tab: PiPackagesTab,
	query: string,
): ManagedExtensionRow[] {
	const normalizedQuery = query.trim().toLowerCase();
	return rows.filter((row) => {
		if (tab !== "all" && row.kind !== tab) return false;
		if (!normalizedQuery) return true;
		return row.id.toLowerCase().includes(normalizedQuery) || row.features.some((feature) => feature.toLowerCase().includes(normalizedQuery));
	});
}
