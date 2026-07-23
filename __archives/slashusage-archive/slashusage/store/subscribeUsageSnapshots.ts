import { usageListeners } from "./usageStoreState.js";

/**
 * Subscribes to usage snapshot updates.
 *
 * @param listener Update listener.
 * @returns Unsubscribe callback.
 */
export function subscribeUsageSnapshots(listener: () => void): () => void {
	usageListeners.add(listener);
	return () => usageListeners.delete(listener);
}
