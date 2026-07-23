import { cmuxWorkspaceShellLinesCache } from "./cmuxWorkspaceShellLinesCache.js";

/**
 * Stores fresh workspace shell lines in the cmux cache.
 *
 * @param lines Workspace shell display lines.
 */
export function setCmuxWorkspaceShellLinesCache(lines: string[]): void {
	cmuxWorkspaceShellLinesCache.lines = lines;
	cmuxWorkspaceShellLinesCache.refreshedAt = Date.now();
}
