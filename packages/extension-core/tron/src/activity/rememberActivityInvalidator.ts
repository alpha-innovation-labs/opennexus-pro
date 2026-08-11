import { type ActivityInvalidator, activityInvalidators } from "./state";

/**
 * Remembers the latest invalidator for one rendered activity key.
 *
 * @param key Activity key.
 * @param invalidate Re-render callback.
 */
export function rememberActivityInvalidator(
	key: string,
	invalidate: ActivityInvalidator,
): void {
	activityInvalidators.set(key, invalidate);
}
