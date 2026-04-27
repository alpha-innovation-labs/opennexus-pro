/**
 * Feature runtime status displayed by the feature management modal.
 */
export type FeatureRuntimeStatus = "enabled" | "disabled";

/**
 * Feature release channel displayed by the feature management modal.
 */
export type FeatureReleaseChannel = "production" | "dev";

/**
 * Flattened feature row derived from the extension feature-flag registry.
 */
export type FeatureStatusRow = {
	extensionId: string;
	feature: string;
	status: FeatureRuntimeStatus;
	channel: FeatureReleaseChannel;
};
