import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";
import type { FeatureReleaseChannel, FeatureRuntimeStatus } from "./types.js";

export type FeatureFlagConfigPatch = {
	channel?: FeatureReleaseChannel;
	status?: FeatureRuntimeStatus;
};

/**
 * Applies a feature-management modal change to an immutable feature-flag config copy.
 *
 * @param config Current feature-flag config.
 * @param extensionId Extension id to update.
 * @param patch Status or channel change to apply.
 * @returns Updated feature-flag config.
 */
export function updateFeatureFlagsConfig(
	config: FeatureFlagsConfig,
	extensionId: string,
	patch: FeatureFlagConfigPatch,
): FeatureFlagsConfig {
	const current = config.extensions[extensionId];
	if (!current) return config;

	const nextValue = {
		...createChannelBase(current, patch.channel),
		...(patch.status ? { enabled: patch.status === "enabled" } : {}),
		...(patch.channel === "dev" ? { devOnly: true, enabled: false } : {}),
	};

	return {
		extensions: {
			...config.extensions,
			[extensionId]: nextValue,
		},
	};
}

/**
 * Creates the base config value while removing devOnly for production channel edits.
 *
 * @param current Current extension feature-flag value.
 * @param channel Optional channel patch.
 * @returns Extension feature-flag value base for the update.
 */
function createChannelBase(
	current: FeatureFlagsConfig["extensions"][string],
	channel?: FeatureReleaseChannel,
): FeatureFlagsConfig["extensions"][string] {
	if (channel !== "production") return current;
	const { devOnly: _devOnly, ...withoutDevOnly } = current;
	return withoutDevOnly;
}
