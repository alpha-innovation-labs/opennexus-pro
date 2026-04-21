import { compiledFeatureFlags } from "./generated/compiledFeatureFlags.js";
import type { FeatureFlagsConfig } from "./types.js";

/**
 * Returns the feature-flag config embedded into the app bundle.
 *
 * @returns Bundled feature-flag config.
 */
export function getBundledFeatureFlagsConfig(): FeatureFlagsConfig {
  return compiledFeatureFlags;
}
