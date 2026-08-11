import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Returns the default RTK install path used by the official Unix installer.
 *
 * @returns Absolute default RTK executable path.
 */
export function getRtkDefaultInstallPath(): string {
	return join(homedir(), ".local", "bin", "rtk");
}
