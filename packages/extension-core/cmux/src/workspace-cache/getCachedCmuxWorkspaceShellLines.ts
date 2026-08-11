import { cmuxWorkspaceShellLinesCache } from "./cmuxWorkspaceShellLinesCache";

/**
 * Reads cached cmux workspace shell lines when available.
 *
 * @returns Cached workspace shell display lines.
 */
export function getCachedCmuxWorkspaceShellLines(): string[] | undefined {
	return cmuxWorkspaceShellLinesCache.lines;
}
