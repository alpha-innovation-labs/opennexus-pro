import { activityInvalidators } from "./activity/state.ts";

/**
 * Invalidates all rendered activity components for the provided keys.
 *
 * @param keys Activity keys to refresh.
 */
export function invalidateActivityKeys(keys: string[]): void {
	for (const key of keys) {
		activityInvalidators.get(key)?.();
	}
}
