const CMUX_WORKSPACE_SHELL_LINES_CACHE_TTL_MS = 10000;

/**
 * Checks whether cached cmux workspace shell lines are fresh enough to reuse.
 *
 * @param refreshedAt Cache refresh timestamp.
 * @returns True when the cache is still fresh.
 */
export function isCmuxWorkspaceShellLinesCacheFresh(refreshedAt: number | undefined): boolean {
	return typeof refreshedAt === "number" && Date.now() - refreshedAt < CMUX_WORKSPACE_SHELL_LINES_CACHE_TTL_MS;
}
