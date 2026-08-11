import type { SessionInfo } from "@earendil-works/pi-coding-agent";

/**
 * Sorts session metadata by modified time from oldest to newest for stable table output.
 *
 * @param sessions Session metadata returned by Pi's session manager.
 * @returns A new sorted session metadata array.
 */
export function sortSessionsByModifiedTime(
	sessions: readonly SessionInfo[],
): SessionInfo[] {
	return [...sessions].sort(
		(first, second) => first.modified.getTime() - second.modified.getTime(),
	);
}
