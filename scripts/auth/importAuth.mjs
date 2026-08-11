import { access } from "node:fs/promises";
import { copyAuthFile } from "./copyAuthFile.mjs";
import { ensureParentDir } from "./ensureParentDir.mjs";
import { resolveNexusAuthTargetPath } from "./resolveNexusAuthTargetPath.mjs";
import { resolvePiAuthSourcePath } from "./resolvePiAuthSourcePath.mjs";

/**
 * Imports Pi auth.json into the installed Nexus agent directory.
 *
 * @returns {Promise<void>}
 */
export async function importAuth() {
	const sourcePath = resolvePiAuthSourcePath();
	const targetPath = resolveNexusAuthTargetPath();

	await access(sourcePath);
	await ensureParentDir(targetPath);
	await copyAuthFile(sourcePath, targetPath);

	console.log(`Imported auth.json from ${sourcePath}`);
	console.log(`Copied auth.json to ${targetPath}`);
}

await importAuth();
