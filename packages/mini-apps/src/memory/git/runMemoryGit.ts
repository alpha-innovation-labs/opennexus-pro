import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Runs a git command inside the memory repository.
 *
 * @param root Memory repository root.
 * @param args Git arguments.
 */
export async function runMemoryGit(root: string, args: string[]): Promise<void> {
	await execFileAsync("git", args, { cwd: root });
}
