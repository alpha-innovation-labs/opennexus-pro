import type { PlaygroundPaneState } from "../types.js";

/**
 * Stops one playground child Pi pane and clears its subscription.
 *
 * @param pane Target pane state.
 */
export async function stopPlaygroundPaneClient(pane: PlaygroundPaneState): Promise<void> {
	pane.unsubscribe?.();
	pane.unsubscribe = null;
	if (pane.client) {
		await pane.client.stop();
	}
	pane.client = null;
	pane.busy = false;
	pane.status = "Ready";
}
