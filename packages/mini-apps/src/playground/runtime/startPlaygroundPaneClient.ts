import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createPlaygroundRpcClient } from "../rpc/createPlaygroundRpcClient.js";
import type { PlaygroundAgentEvent, PlaygroundPaneState, PlaygroundState } from "../types.js";
import { handlePlaygroundEvent } from "./handlePlaygroundEvent.js";

/**
 * Starts one playground child Pi pane if it is not already running.
 *
 * @param state Playground runtime state.
 * @param pane Target pane state.
 * @param ctx Extension runtime context.
 */
export async function startPlaygroundPaneClient(
	state: PlaygroundState,
	pane: PlaygroundPaneState,
	ctx: ExtensionContext,
): Promise<void> {
	if (pane.client) return;
	pane.client = createPlaygroundRpcClient(ctx);
	pane.unsubscribe = pane.client.onEvent((event) => {
		handlePlaygroundEvent(state, pane.key, event as PlaygroundAgentEvent);
	});
	await pane.client.start();
	pane.status = "Ready";
}
