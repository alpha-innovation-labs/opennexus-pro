import type { FeatureFlagConfig, FeatureFlagsConfig } from "@nexus/feature-flags/types.js";
import { getFeatureManagementGroup } from "./getFeatureManagementGroup.js";
import type { FeatureStatusCategory, FeatureStatusRow } from "./types.js";

/**
 * Creates flattened feature rows with runtime status and release channel labels.
 *
 * @param config Static feature-flag config.
 * @param runtimeConfig Feature-flag config after runtime availability rules.
 * @returns One display row for each declared feature entry.
 */
export function createFeatureStatusRows(
	config: FeatureFlagsConfig,
	runtimeConfig: FeatureFlagsConfig,
): FeatureStatusRow[] {
	return [
		...createCategoryFeatureStatusRows("extensions", config.extensions, runtimeConfig.extensions),
		...createCategoryFeatureStatusRows("other", config.other ?? {}, runtimeConfig.other ?? config.other ?? {}),
	];
}

/**
 * Creates status rows for a single feature category.
 *
 * @param category Feature category assigned to every row.
 * @param config Static category config.
 * @param runtimeConfig Runtime-adjusted category config.
 * @returns Display rows for the category.
 */
function createCategoryFeatureStatusRows(
	category: FeatureStatusCategory,
	config: Record<string, FeatureFlagConfig>,
	runtimeConfig: Record<string, FeatureFlagConfig>,
): FeatureStatusRow[] {
	return Object.entries(config).map(([featureId, value]) => {
		const status = runtimeConfig[featureId]?.enabled ? "enabled" : "disabled";
		const channel = value.devOnly ? "dev" : "production";

		return {
			category,
			extensionId: featureId,
			feature: featureId,
			status,
			channel,
			group: getFeatureManagementGroup(channel),
		};
	});
}
