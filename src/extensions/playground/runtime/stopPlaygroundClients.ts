import type { PlaygroundState } from "../types.js";
import { stopPlaygroundPaneClient } from "./stopPlaygroundPaneClient.js";

/**
 * Stops all playground child Pi panes.
 *
 * @param state Playground runtime state.
 */
export async function stopPlaygroundClients(state: PlaygroundState): Promise<void> {
	await Promise.all(state.panes.map((pane) => stopPlaygroundPaneClient(pane)));
}
