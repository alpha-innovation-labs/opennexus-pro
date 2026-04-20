import type { Details } from "../../vendor/types.js";

/**
 * Checks whether a completed slash-result snapshot ended in failure.
 *
 * @param result Renderable slash result.
 * @returns True when a finished step failed.
 */
export function isSlashResultError(result: { details?: Details }): boolean {
	return result.details?.results.some((entry) => entry.exitCode !== 0 && entry.progress?.status !== "running") || false;
}
