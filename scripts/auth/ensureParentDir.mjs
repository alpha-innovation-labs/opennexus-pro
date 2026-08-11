import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Ensures the parent directory for a file path exists.
 *
 * @param {string} filePath File path whose parent directory should exist.
 * @returns {Promise<void>}
 */
export async function ensureParentDir(filePath) {
	await mkdir(dirname(filePath), { recursive: true });
}
