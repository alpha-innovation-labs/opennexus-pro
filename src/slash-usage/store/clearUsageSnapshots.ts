import { usageListeners, usageSnapshots } from "./usageStoreState.js";

/**
 * Clears cached usage snapshots and notifies subscribers.
 */
export function clearUsageSnapshots(): void {
	usageSnapshots.clear();
	for (const listener of usageListeners) listener();
}
