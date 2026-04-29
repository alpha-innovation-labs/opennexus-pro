import type { FeatureFlagConfig, FeatureFlagsConfig } from "@nexus/feature-flags/types.js";
import type { FeatureReleaseChannel, FeatureRuntimeStatus, FeatureStatusCategory } from "./types.js";

export type FeatureFlagConfigPatch = {
	channel?: FeatureReleaseChannel;
	status?: FeatureRuntimeStatus;
};

/**
 * Applies a feature-management modal change to an immutable feature-flag config copy.
 *
 * @param config Current feature-flag config.
 * @param featureId Feature id to update.
 * @param patch Status or channel change to apply.
 * @param category Feature category that owns the id.
 * @returns Updated feature-flag config.
 */
export function updateFeatureFlagsConfig(
	config: FeatureFlagsConfig,
	featureId: string,
	patch: FeatureFlagConfigPatch,
	category: FeatureStatusCategory = "extensions",
): FeatureFlagsConfig {
	const entries = category === "extensions" ? config.extensions : config.other;
	const current = entries?.[featureId];
	if (!current) return config;

	const nextValue = {
		...createChannelBase(current, patch.channel),
		...(patch.status ? { enabled: patch.status === "enabled" } : {}),
		...(patch.channel === "dev" ? { devOnly: true, enabled: false } : {}),
	};

	if (category === "extensions") {
		return {
			...config,
			extensions: {
				...config.extensions,
				[featureId]: nextValue,
			},
		};
	}

	return {
		...config,
		other: {
			...(config.other ?? {}),
			[featureId]: nextValue,
		},
	};
}

/**
 * Creates the base config value while removing devOnly for production channel edits.
 *
 * @param current Current feature-flag value.
 * @param channel Optional channel patch.
 * @returns Feature-flag value base for the update.
 */
function createChannelBase(current: FeatureFlagConfig, channel?: FeatureReleaseChannel): FeatureFlagConfig {
	if (channel !== "production") return current;
	const { devOnly: _devOnly, ...withoutDevOnly } = current;
	return withoutDevOnly;
}
