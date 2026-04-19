import { resolve } from "node:path";

/**
 * Returns the Neo config file path.
 *
 * @param cwd Project working directory.
 * @returns Absolute Neo config path.
 */
export function getNeoConfigPath(cwd: string): string {
	return resolve(cwd, ".pi", "extensions", "neo-editor", "config.json");
}
