import { join } from "node:path";
import { getUserConfigDirPath } from "./getUserConfigDirPath.js";

/**
 * Resolves the Nexus user config file path.
 *
 * @returns Absolute path to ~/.config/nexus/config.json.
 */
export function getUserConfigPath(): string {
	return join(getUserConfigDirPath(), "config.json");
}
