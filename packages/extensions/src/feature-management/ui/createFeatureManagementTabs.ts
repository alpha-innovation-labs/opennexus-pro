import type { FeatureManagementTab } from "../model/types.js";

/**
 * Creates the ordered feature-management tabs.
 *
 * @returns Feature-management tab order.
 */
export function createFeatureManagementTabs(): FeatureManagementTab[] {
	return ["extensions", "mini-apps"];
}
