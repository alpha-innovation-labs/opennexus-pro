import { cmuxTitleSyncState } from "./cmuxTitleSyncState.js";

/**
 * Returns whether cmux title syncing is currently enabled.
 *
 * @returns True when the cmux extension is active.
 */
export function getCmuxTitleSyncEnabled(): boolean {
	return cmuxTitleSyncState.enabled;
}
