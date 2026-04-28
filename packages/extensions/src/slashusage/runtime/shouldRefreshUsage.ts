import type { UsageSnapshot } from "../types.js";

const USAGE_REFRESH_MS = 60_000;

/**
 * Decides whether a cached snapshot should be refreshed.
 *
 * @param snapshot Cached usage snapshot.
 * @param force Whether refresh is forced.
 * @returns True when the snapshot should be refreshed.
 */
export function shouldRefreshUsage(snapshot: UsageSnapshot | undefined, force = false): boolean {
	return force || !snapshot || Date.now() - snapshot.fetchedAt >= USAGE_REFRESH_MS;
}
