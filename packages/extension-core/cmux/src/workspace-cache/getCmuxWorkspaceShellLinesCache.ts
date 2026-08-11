import { cmuxWorkspaceShellLinesCache } from "./cmuxWorkspaceShellLinesCache";
import type { CmuxWorkspaceShellLinesCache } from "./types";

/**
 * Reads the in-memory cmux workspace shell lines cache.
 *
 * @returns Current cache object.
 */
export function getCmuxWorkspaceShellLinesCache(): CmuxWorkspaceShellLinesCache {
	return cmuxWorkspaceShellLinesCache;
}
