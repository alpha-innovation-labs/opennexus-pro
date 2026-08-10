import { cmuxTitleSyncState } from "./cmuxTitleSyncState";

/**
 * Updates the runtime cmux title-sync enablement flag.
 *
 * @param enabled Whether title syncing should be active.
 */
export function setCmuxTitleSyncEnabled(enabled: boolean): void {
	cmuxTitleSyncState.enabled = enabled;
}
