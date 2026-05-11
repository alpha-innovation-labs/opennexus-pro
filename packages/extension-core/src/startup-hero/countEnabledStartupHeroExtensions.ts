import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";
import { readAvailableStartupHeroFeatureFlagsConfig } from "./readAvailableStartupHeroFeatureFlagsConfig.js";

/**
 * Counts enabled extension-category features from the active source config or bundled release config.
 *
 * @returns Number of currently enabled extensions.
 */
export function countEnabledStartupHeroExtensions(): number {
	const config = readAvailableStartupHeroFeatureFlagsConfig();
	const availableConfig = applySystemExtensionAvailability(config);
	return Object.values(availableConfig.extensions).filter((extension) => extension.category !== "mini-app" && extension.enabled).length;
}
