import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Finds an LSP executable, preferring project-local binaries before PATH.
 *
 * @param cwd Workspace directory.
 * @param command Executable command name.
 * @returns Resolved executable path or the original command.
 */
export function findExecutablePath(cwd: string, command: string): string {
	const candidates = [path.join(cwd, "node_modules", ".bin", command), path.join(cwd, ".venv", "bin", command)];
	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) return candidate;
	}
	return command;
}
