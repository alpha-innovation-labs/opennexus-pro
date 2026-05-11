import type { UsageSnapshot } from "../types.js";
import { usageListeners, usageSnapshots } from "./usageStoreState.js";

/**
 * Stores a provider usage snapshot and notifies subscribers.
 *
 * @param snapshot Fresh provider usage snapshot.
 */
export function setUsageSnapshot(snapshot: UsageSnapshot): void {
	usageSnapshots.set(snapshot.provider, snapshot);
	for (const listener of usageListeners) listener();
}
