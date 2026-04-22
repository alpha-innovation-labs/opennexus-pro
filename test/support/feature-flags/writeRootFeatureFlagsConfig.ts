import { writeFile } from "node:fs/promises";
import type { FeatureFlagsConfig } from "../../../src/feature-flags/types.js";

/**
 * Writes the root feature-flags.json file.
 *
 * @param config Feature-flag config to persist.
 * @returns Promise that resolves when the file is written.
 */
export async function writeRootFeatureFlagsConfig(config: FeatureFlagsConfig): Promise<void> {
  await writeFile("feature-flags.json", `${JSON.stringify(config, null, 2)}\n`, "utf8");
}
