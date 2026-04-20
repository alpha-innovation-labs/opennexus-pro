import type { Details } from "../../vendor/types.js";

/**
 * Checks whether a slash-result snapshot still has running work.
 *
 * @param result Renderable slash result.
 * @returns True when any progress entry is still running.
 */
export function isSlashResultRunning(result: { details?: Details }): boolean {
	return result.details?.progress?.some((entry) => entry.status === "running")
		|| result.details?.results.some((entry) => entry.progress?.status === "running")
		|| false;
}
