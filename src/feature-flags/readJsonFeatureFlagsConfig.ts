import { readFileSync } from "node:fs";
import { getFeatureFlagsConfigPath } from "./getFeatureFlagsConfigPath.js";
import type { FeatureFlagsConfig } from "./types.js";

/**
 * Reads the root feature-flags JSON file from disk.
 *
 * @returns Parsed feature-flags configuration.
 */
export function readJsonFeatureFlagsConfig(): FeatureFlagsConfig {
  return JSON.parse(readFileSync(getFeatureFlagsConfigPath(), "utf8")) as FeatureFlagsConfig;
}
