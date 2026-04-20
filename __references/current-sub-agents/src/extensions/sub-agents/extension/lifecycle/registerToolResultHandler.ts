import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { renderWidget } from "../../vendor/render.js";
import type { SubagentState } from "../../vendor/types.js";

/**
 * Registers the live widget refresh hook for subagent tool results.
 *
 * @param pi Pi extension API.
 * @param state Mutable extension state.
 * @param ensurePoller Async-poller ensure callback.
 */
export function registerToolResultHandler(
	pi: ExtensionAPI,
	state: SubagentState,
	ensurePoller: () => void,
): void {
	pi.on("tool_result", (event, ctx) => {
		if (event.toolName !== "subagent" || !ctx.hasUI) return;
		state.lastUiContext = ctx;
		if (state.asyncJobs.size > 0) {
			renderWidget(ctx, Array.from(state.asyncJobs.values()));
			ensurePoller();
		}
	});
}
