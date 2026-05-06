import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { PlaygroundState } from "../types.js";
import { startPlaygroundPaneClient } from "./startPlaygroundPaneClient.js";

/**
 * Starts all playground child Pi panes.
 *
 * @param state Playground runtime state.
 * @param ctx Extension runtime context.
 */
export async function startPlaygroundClients(state: PlaygroundState, ctx: ExtensionContext): Promise<void> {
	state.ctx = ctx;
	await Promise.all(state.panes.map((pane) => startPlaygroundPaneClient(state, pane, ctx)));
}
