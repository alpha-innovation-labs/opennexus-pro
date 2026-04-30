import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getUserConfigPath } from "./getUserConfigPath.js";
import type { NexusUserConfig } from "./types.js";

/**
 * Writes the Nexus user config to disk.
 *
 * @param config User config to persist.
 */
export function writeNexusUserConfig(config: NexusUserConfig): void {
	const configPath = getUserConfigPath();
	mkdirSync(dirname(configPath), { recursive: true });
	writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}
