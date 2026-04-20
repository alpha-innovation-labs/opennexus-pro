import { readFileSync } from "node:fs";
import { isBundledBinary } from "../runtime/package/isBundledBinary.js";
import { getBundledFeatureFlagsConfig } from "./getBundledFeatureFlagsConfig.js";
import { getFeatureFlagsConfigPath } from "./getFeatureFlagsConfigPath.js";
import type { FeatureFlagsConfig } from "./types.js";

/**
 * Reads the root feature-flags configuration.
 *
 * @returns Parsed feature-flags configuration.
 */
export function readFeatureFlagsConfig(): FeatureFlagsConfig {
  if (isBundledBinary(import.meta.url)) {
    return getBundledFeatureFlagsConfig();
  }

  return JSON.parse(readFileSync(getFeatureFlagsConfigPath(), "utf8")) as FeatureFlagsConfig;
}
