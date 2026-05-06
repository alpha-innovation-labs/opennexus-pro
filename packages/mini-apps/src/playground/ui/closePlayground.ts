import type { PlaygroundState } from "../types.js";
import { stopPlaygroundClients } from "../runtime/stopPlaygroundClients.js";

/**
 * Closes the playground overlay and disposes the child Pi processes.
 *
 * @param state Playground runtime state.
 */
export async function closePlayground(state: PlaygroundState): Promise<void> {
	if (state.closing) return;
	state.closing = true;
	const finish = state.finish;
	state.overlayHandle?.hide();
	state.overlayHandle = null;
	state.finish = null;
	state.requestRender = null;
	finish?.();
	await stopPlaygroundClients(state);
	state.ctx = null;
	for (const pane of state.panes) {
		pane.transcript = [];
		pane.liveAssistantText = "";
		pane.status = "Ready";
	}
	state.closing = false;
}
