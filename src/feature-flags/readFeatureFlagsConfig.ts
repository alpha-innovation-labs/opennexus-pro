import { compiledFeatureFlags } from "./generated/compiledFeatureFlags.js";
import type { FeatureFlagsConfig } from "./types.js";

/**
 * Reads the feature-flag configuration compiled into the app.
 *
 * @returns Parsed feature-flags configuration.
 */
export function readFeatureFlagsConfig(): FeatureFlagsConfig {
  return compiledFeatureFlags;
}
