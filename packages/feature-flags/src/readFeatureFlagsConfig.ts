import { readJsonFeatureFlagsConfig } from "./readJsonFeatureFlagsConfig.js";
import type { FeatureFlagsConfig } from "./types.js";

/**
 * Reads the source-runtime feature-flag configuration from the root JSON file.
 *
 * @returns Parsed feature-flags configuration.
 */
export function readFeatureFlagsConfig(): FeatureFlagsConfig {
  return readJsonFeatureFlagsConfig();
}
