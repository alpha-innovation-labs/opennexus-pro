import { isAbsolute, resolve } from "node:path";

/**
 * Resolves a tracked file path against the active project root.
 *
 * @param projectRoot Active project root.
 * @param cwd Session cwd.
 * @param selectedPath Tracked file path.
 * @returns Absolute tracked file path.
 */
export function resolveTrackedPath(
	projectRoot: string,
	cwd: string,
	selectedPath: string,
): string {
	if (isAbsolute(selectedPath)) return selectedPath;
	return resolve(projectRoot || cwd, selectedPath);
}
