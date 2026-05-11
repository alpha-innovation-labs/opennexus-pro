import { expandHomePath } from "@nexus/runtime/config/expandHomePath.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { getDefaultAutomationDbPath } from "./getDefaultAutomationDbPath.js";

/**
 * Resolves the configured automations SQLite database path.
 *
 * @returns Absolute SQLite database path.
 */
export function getAutomationDbPath(): string {
	const configuredPath = readNexusUserConfig().miniApps?.automations?.dbPath;
	return typeof configuredPath === "string" ? expandHomePath(configuredPath) : getDefaultAutomationDbPath();
}
