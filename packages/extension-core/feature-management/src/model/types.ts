/**
 * Feature runtime status displayed by the feature management modal.
 */
export type FeatureRuntimeStatus = "enabled" | "disabled";

/**
 * Focusable controls available on each feature-management row.
 */
export type FeatureManagementControl = "status";

/**
 * Product category used for sorting/grouping.
 */
export type FeatureStatusCategory = "core" | "dev" | "pro" | "mini-apps";

/**
 * Feature-management group displayed as a section header.
 */
export type FeatureManagementGroup =
	| "Core"
	| "Nexus"
	| "Pi Packages"
	| "Mini apps";

/**
 * Source config bucket that owns a feature flag entry.
 */
export type FeatureFlagSourceCategory = "extensions" | "other";

/**
 * Flattened feature row derived from the feature-flag registry.
 */
export type FeatureStatusRow = {
	category: FeatureStatusCategory;
	sourceCategory: FeatureFlagSourceCategory;
	extensionId: string;
	feature: string;
	status: FeatureRuntimeStatus;
	group: FeatureManagementGroup;
};
