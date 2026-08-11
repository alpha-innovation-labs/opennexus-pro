import { cmuxWorkspaceShellLinesCache } from "./cmuxWorkspaceShellLinesCache";

/**
 * Clears cached cmux workspace shell lines.
 */
export function clearCmuxWorkspaceShellLinesCache(): void {
	delete cmuxWorkspaceShellLinesCache.lines;
	delete cmuxWorkspaceShellLinesCache.refreshedAt;
	delete cmuxWorkspaceShellLinesCache.pending;
}
