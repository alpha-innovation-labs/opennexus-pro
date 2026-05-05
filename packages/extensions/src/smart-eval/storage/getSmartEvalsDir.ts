import { homedir } from "node:os";
import { resolve } from "node:path";

/**
 * Resolves the smart-eval storage directory under local user data.
 *
 * @returns Absolute evals directory path.
 */
export function getSmartEvalsDir(): string {
	return resolve(homedir(), ".local", "share", "evals");
}
