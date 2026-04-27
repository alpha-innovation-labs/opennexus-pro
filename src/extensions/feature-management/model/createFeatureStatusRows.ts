import type { FeatureFlagsConfig } from "../../../feature-flags/types.js";
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
	return Object.entries(config.extensions).flatMap(([extensionId, value]) => {
		const status = runtimeConfig.extensions[extensionId]?.enabled ? "enabled" : "disabled";
		const channel = value.devOnly ? "dev" : "production";

		return value.features.map((feature) => ({
			extensionId,
			feature,
			status,
			channel,
		}));
	});
}
