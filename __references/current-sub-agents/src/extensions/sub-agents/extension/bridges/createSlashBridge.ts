import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { registerSlashSubagentBridge } from "../../vendor/slash-bridge.js";
import type { SubagentState } from "../../vendor/types.js";

/**
 * Creates the slash-command bridge bound to the current executor.
 *
 * @param pi Pi extension API.
 * @param state Mutable extension state.
 * @param execute Executor callback.
 * @returns Slash bridge controls.
 */
export function createSlashBridge(
	pi: ExtensionAPI,
	state: SubagentState,
	execute: (id: string, params: unknown, signal: AbortSignal, onUpdate: unknown, ctx: ExtensionContext) => Promise<unknown>,
): { cancelAll: () => void; dispose: () => void } {
	return registerSlashSubagentBridge({
		events: pi.events,
		getContext: () => state.lastUiContext,
		execute: (id, params, signal, onUpdate, ctx) => execute(id, params, signal, onUpdate, ctx),
	});
}
