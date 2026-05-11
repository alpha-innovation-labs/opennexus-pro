import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";
import type { FeatureFlagConfig } from "@nexus/feature-flags/types.js";
import { readAvailableStartupHeroFeatureFlagsConfig } from "./readAvailableStartupHeroFeatureFlagsConfig.js";

/**
 * Counts enabled mini-app-category features from extension and non-extension feature buckets.
 *
 * @returns Number of currently enabled mini-apps.
 */
export function countEnabledStartupHeroMiniApps(): number {
	const config = readAvailableStartupHeroFeatureFlagsConfig();
	const availableConfig = applySystemExtensionAvailability(config);
	return [
		...Object.values(availableConfig.extensions),
		...Object.values(availableConfig.other ?? {}),
	].filter(isEnabledMiniApp).length;
}

/**
 * Reports whether a feature flag is an enabled mini-app.
 *
 * @param feature Feature flag to inspect.
 * @returns True when the feature is enabled and categorized as a mini-app.
 */
function isEnabledMiniApp(feature: FeatureFlagConfig): boolean {
	return feature.category === "mini-app" && feature.enabled;
}
