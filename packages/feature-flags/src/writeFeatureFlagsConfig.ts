import { writeFileSync } from "node:fs";
import { getFeatureFlagsConfigPath } from "./getFeatureFlagsConfigPath.js";
import type { FeatureFlagsConfig } from "./types.js";

/**
 * Writes the editable feature-flag configuration to disk.
 *
 * @param config Feature-flag configuration to persist.
 */
export function writeFeatureFlagsConfig(config: FeatureFlagsConfig): void {
	writeFileSync(getFeatureFlagsConfigPath(), `${JSON.stringify(config, null, 2)}\n`, "utf8");
}
