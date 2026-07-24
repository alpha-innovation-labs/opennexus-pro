import type { FeatureManagementGroup, FeatureStatusRow } from "../model/types.js";
import { getFeatureGroupRank } from "./getFeatureGroupRank.js";

/**
 * Sorts feature rows into stable sections (Mini apps, Extensions),
 * then alphabetically within each section.
 *
 * @param rows Feature rows to sort.
 * @returns New array sorted by group and feature name.
 */
export function sortFeatureStatusRows(rows: FeatureStatusRow[]): FeatureStatusRow[] {
	return [...rows].sort((left, right) => {
		const groupDiff = getFeatureGroupRank(left.group) - getFeatureGroupRank(right.group);
		if (groupDiff !== 0) return groupDiff;
		return left.feature.localeCompare(right.feature);
	});
}
