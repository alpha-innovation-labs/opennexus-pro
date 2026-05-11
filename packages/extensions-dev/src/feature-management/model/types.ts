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
 * Source config bucket that owns a feature flag entry.
 */
export type FeatureFlagSourceCategory = "extensions" | "other";

/**
 * Product category displayed by the feature management modal.
 */
export type FeatureStatusCategory = "core" | "dev" | "pro" | "mini-apps";

/**
 * Feature inventory tab selected in the feature management modal.
 */
export type FeatureManagementTab = FeatureStatusCategory;

/**
 * Focusable controls available on each feature-management row.
 */
export type FeatureManagementControl = "status" | "channel";

/**
 * Flattened feature row derived from the feature-flag registry.
 */
export type FeatureStatusRow = {
	category: FeatureStatusCategory;
	sourceCategory: FeatureFlagSourceCategory;
	extensionId: string;
	feature: string;
	status: FeatureRuntimeStatus;
	channel: FeatureReleaseChannel;
	group: FeatureManagementGroup;
};
