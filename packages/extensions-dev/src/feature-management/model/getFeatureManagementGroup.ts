import type { FeatureManagementGroup, FeatureReleaseChannel } from "./types.js";

/**
 * Maps a release channel to its feature-management group label.
 *
 * @param channel Release channel to classify.
 * @returns Group label for the feature row.
 */
export function getFeatureManagementGroup(channel: FeatureReleaseChannel): FeatureManagementGroup {
	return channel === "dev" ? "Playground" : "Production";
}
