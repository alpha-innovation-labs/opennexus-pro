import type { FeatureManagementTab, FeatureStatusRow } from "../model/types.js";

/**
 * Filters feature status rows for the active feature-management tab.
 *
 * @param rows Full feature row list.
 * @param tab Active feature category tab.
 * @returns Rows visible for the selected tab.
 */
export function filterFeatureStatusRowsByTab(rows: FeatureStatusRow[], tab: FeatureManagementTab): FeatureStatusRow[] {
	if (tab === "all") return rows;
	return rows.filter((row) => row.category === tab);
}
