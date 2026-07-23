import type { FeatureManagementGroup, FeatureStatusCategory } from "./types.js";

/**
 * Maps a feature status category to its group label.
 * Mini-apps go to Playground, everything else to Production.
 *
 * @param featureId Extension/feature id.
 * @returns Group label for the feature row.
 */
export function getFeatureManagementGroup(featureId: string): FeatureManagementGroup {
	const knownMiniApps = new Set(["tetris"]);
	return knownMiniApps.has(featureId) ? "Playground" : "Production";
}
