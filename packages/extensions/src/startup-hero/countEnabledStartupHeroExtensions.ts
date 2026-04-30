import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { readFeatureFlagsConfig } from "@nexus/feature-flags/readFeatureFlagsConfig.js";
import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";

/**
 * Counts enabled extensions from the active source config or bundled release config.
 *
 * @returns Number of currently enabled extensions.
 */
export function countEnabledStartupHeroExtensions(): number {
	const config = readAvailableFeatureFlagsConfig();
	const availableConfig = applySystemExtensionAvailability(config);
	return Object.values(availableConfig.extensions).filter((extension) => extension.enabled).length;
}

/**
 * Reads source feature flags, falling back to bundled release flags.
 *
 * @returns Feature flag config available to this runtime.
 */
function readAvailableFeatureFlagsConfig(): FeatureFlagsConfig {
	try {
		return readFeatureFlagsConfig();
	} catch {
		return getBundledFeatureFlagsConfig();
	}
}
