import { join } from "node:path";
import { getProjectConfigDirPath } from "@nexus/runtime/config/getProjectConfigDirPath";

/**
 * Returns the Neo config file path.
 *
 * @param cwd Project working directory.
 * @returns Absolute Neo config path.
 */
export function getNeoConfigPath(cwd: string): string {
	return join(
		getProjectConfigDirPath(cwd),
		"extensions",
		"neo-editor",
		"config.json",
	);
}
