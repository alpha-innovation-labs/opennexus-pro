/**
 * Feature runtime status displayed by the feature management modal.
 */
export type FeatureRuntimeStatus = "enabled" | "disabled";

/**
 * Feature release channel displayed by the feature management modal.
 */
export type FeatureReleaseChannel = "production" | "dev";

/**
 * Feature-management group displayed as a section header.
 */
export type FeatureManagementGroup = "Playground" | "Production";

/**
 * Focusable controls available on each feature-management row.
 */
export type FeatureManagementControl = "status" | "channel";

/**
 * Flattened feature row derived from the extension feature-flag registry.
 */
export type FeatureStatusRow = {
	extensionId: string;
	feature: string;
	status: FeatureRuntimeStatus;
	channel: FeatureReleaseChannel;
	group: FeatureManagementGroup;
};
