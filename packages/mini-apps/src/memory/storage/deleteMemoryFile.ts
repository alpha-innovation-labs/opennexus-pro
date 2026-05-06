import { unlink } from "node:fs/promises";
import { removeEmptyParentDirectories } from "./removeEmptyParentDirectories.js";

/**
 * Deletes one markdown memory file and prunes empty parent folders.
 *
 * @param path Absolute file path to delete.
 * @param root Memory root boundary for pruning.
 */
export async function deleteMemoryFile(path: string, root: string): Promise<void> {
	await unlink(path);
	await removeEmptyParentDirectories(path, root);
}
