import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";
import { getFeatureManagementGroup } from "./getFeatureManagementGroup.js";
import type { FeatureStatusRow } from "./types.js";

/**
 * Creates flattened feature rows with runtime status and release channel labels.
 *
 * @param config Static feature-flag config.
 * @param runtimeConfig Feature-flag config after runtime availability rules.
 * @returns One display row for each declared feature.
 */
export function createFeatureStatusRows(
	config: FeatureFlagsConfig,
	runtimeConfig: FeatureFlagsConfig,
): FeatureStatusRow[] {
	return Object.entries(config.extensions).map(([extensionId, value]) => {
		const status = runtimeConfig.extensions[extensionId]?.enabled ? "enabled" : "disabled";
		const channel = value.devOnly ? "dev" : "production";

		return {
			extensionId,
			feature: extensionId,
			status,
			channel,
			group: getFeatureManagementGroup(channel),
		};
	});
}
