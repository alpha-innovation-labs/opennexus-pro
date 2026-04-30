import { existsSync, readFileSync } from "node:fs";
import { getUserConfigPath } from "./getUserConfigPath.js";
import type { NexusUserConfig } from "./types.js";

/**
 * Reads the Nexus user config from disk.
 *
 * @returns Parsed user config, or an empty config when none exists.
 */
export function readNexusUserConfig(): NexusUserConfig {
	const configPath = getUserConfigPath();
	if (!existsSync(configPath)) return {};
	return JSON.parse(readFileSync(configPath, "utf8")) as NexusUserConfig;
}
