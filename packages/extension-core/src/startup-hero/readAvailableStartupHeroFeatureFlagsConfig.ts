import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { readFeatureFlagsConfig } from "@nexus/feature-flags/readFeatureFlagsConfig.js";
import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";

/**
 * Reads source feature flags, falling back to bundled release flags.
 *
 * @returns Feature flag config available to this runtime.
 */
export function readAvailableStartupHeroFeatureFlagsConfig(): FeatureFlagsConfig {
	try {
		return readFeatureFlagsConfig();
	} catch {
		return getBundledFeatureFlagsConfig();
	}
}
