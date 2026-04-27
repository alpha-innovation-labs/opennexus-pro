import type { FeatureManagementGroup } from "../model/types.js";

/**
 * Returns the display order rank for feature-management groups.
 *
 * @param group Group label to rank.
 * @returns Numeric sort rank.
 */
export function getFeatureGroupRank(group: FeatureManagementGroup): number {
	return group === "Playground" ? 0 : 1;
}
