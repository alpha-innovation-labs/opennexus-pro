import { cmuxWorkspaceShellLinesCache } from "./cmuxWorkspaceShellLinesCache.js";

/**
 * Reads cached cmux workspace shell lines when available.
 *
 * @returns Cached workspace shell display lines.
 */
export function getCachedCmuxWorkspaceShellLines(): string[] | undefined {
	return cmuxWorkspaceShellLinesCache.lines;
}
