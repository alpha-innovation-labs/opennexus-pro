import * as path from "node:path";

/**
 * Resolves a user-supplied path against the current workspace.
 *
 * @param cwd Current workspace directory.
 * @param file User-supplied path.
 * @returns Absolute file path.
 */
export function resolveProjectPath(cwd: string, file: string): string {
	return path.isAbsolute(file) ? file : path.resolve(cwd, file.replace(/^@/, ""));
}
