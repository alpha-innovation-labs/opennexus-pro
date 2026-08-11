import { chmod, copyFile, stat } from "node:fs/promises";

/**
 * Copies auth.json and preserves its file mode.
 *
 * @param {string} sourcePath Source auth.json path.
 * @param {string} targetPath Target auth.json path.
 * @returns {Promise<void>}
 */
export async function copyAuthFile(sourcePath, targetPath) {
	await copyFile(sourcePath, targetPath);
	const sourceStat = await stat(sourcePath);
	await chmod(targetPath, sourceStat.mode);
}
