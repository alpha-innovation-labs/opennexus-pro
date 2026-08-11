import { join } from "node:path";
import { getProjectConfigDirPath } from "./getProjectConfigDirPath";

/**
 * Resolves the Nexus project config file path.
 *
 * @param cwd Project working directory.
 * @returns Absolute project config file path (.nexus/config.json).
 */
export function getProjectConfigPath(cwd: string): string {
	return join(getProjectConfigDirPath(cwd), "config.json");
}
