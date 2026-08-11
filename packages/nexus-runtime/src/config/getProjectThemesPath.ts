import { join } from "node:path";
import { getProjectConfigDirPath } from "./getProjectConfigDirPath";

/**
 * Resolves the Nexus project themes directory path.
 *
 * @param cwd Project working directory.
 * @returns Absolute project themes directory path.
 */
export function getProjectThemesPath(cwd: string): string {
	return join(getProjectConfigDirPath(cwd), "themes");
}
