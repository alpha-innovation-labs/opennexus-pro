import { readFile } from "node:fs/promises";
import type { FeatureFlagsConfig } from "../../../packages/feature-flags/src/types.js";

/**
 * Reads the root feature-flags.json file.
 *
 * @returns Parsed root feature-flag config.
 */
export async function readRootFeatureFlagsConfig(): Promise<FeatureFlagsConfig> {
  return JSON.parse(await readFile("feature-flags.json", "utf8")) as FeatureFlagsConfig;
}
