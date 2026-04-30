import { ensureMemoryGitRepository } from "./ensureMemoryGitRepository.js";
import { runMemoryGit } from "./runMemoryGit.js";

/**
 * Commits all staged memory repository changes as one operation.
 *
 * @param root Memory repository root.
 * @param message Operation-level commit message.
 */
export async function commitMemoryOperation(root: string, message: string): Promise<void> {
	await ensureMemoryGitRepository(root);
	await runMemoryGit(root, ["add", "-A"]);
	await runMemoryGit(root, ["diff", "--cached", "--quiet", "--exit-code"]).catch(async () => {
		await runMemoryGit(root, ["-c", "user.name=Nexus Memory", "-c", "user.email=nexus-memory@local", "commit", "-m", message]);
	});
}
