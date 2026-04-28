import { cmuxWorkspaceShellLinesCache } from "./cmuxWorkspaceShellLinesCache.js";
import type { CmuxWorkspaceShellLinesCache } from "./types.js";

/**
 * Reads the in-memory cmux workspace shell lines cache.
 *
 * @returns Current cache object.
 */
export function getCmuxWorkspaceShellLinesCache(): CmuxWorkspaceShellLinesCache {
	return cmuxWorkspaceShellLinesCache;
}
