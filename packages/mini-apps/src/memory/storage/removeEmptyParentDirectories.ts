import { readdir, rmdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

/**
 * Removes empty parent directories up to the memory root.
 *
 * @param startPath Deleted file path whose parents should be pruned.
 * @param root Memory root boundary.
 */
export async function removeEmptyParentDirectories(startPath: string, root: string): Promise<void> {
	const rootPath = resolve(root);
	let current = dirname(resolve(startPath));
	while (current.startsWith(rootPath) && current !== rootPath) {
		const entries = await readdir(current).catch(() => []);
		if (entries.length > 0) return;
		await rmdir(current);
		current = dirname(current);
	}
}
