import { mkdir } from "node:fs/promises";
import { runMemoryGit } from "./runMemoryGit.js";

/**
 * Ensures the memory root exists and is initialized as a git repository.
 *
 * @param root Memory root directory.
 */
export async function ensureMemoryGitRepository(root: string): Promise<void> {
	await mkdir(root, { recursive: true });
	await runMemoryGit(root, ["rev-parse", "--is-inside-work-tree"]).catch(async () => {
		await runMemoryGit(root, ["init"]);
	});
}
