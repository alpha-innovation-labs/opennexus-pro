import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { clearSlashSnapshots } from "../../vendor/slash-live-state.js";
import { WIDGET_KEY, type SubagentState } from "../../vendor/types.js";
import { resetSessionState } from "./resetSessionState.js";

/**
 * Registers Pi session lifecycle handlers for subagents.
 *
 * @param pi Pi extension API.
 * @param state Mutable extension state.
 * @param resetJobs Async-job reset callback.
 * @param stopResultWatcher Result watcher stop callback.
 * @param slashBridge Slash bridge controls.
 * @param promptTemplateBridge Prompt-template bridge controls.
 */
export function registerSessionHandlers(
	pi: ExtensionAPI,
	state: SubagentState,
	resetJobs: (ctx: Parameters<typeof resetSessionState>[2]) => void,
	stopResultWatcher: () => void,
	slashBridge: { cancelAll: () => void; dispose: () => void },
	promptTemplateBridge: { cancelAll: () => void; dispose: () => void },
): void {
	pi.on("session_start", (_event, ctx) => {
		resetSessionState(state, resetJobs, ctx);
	});

	pi.on("session_shutdown", () => {
		stopResultWatcher();
		if (state.poller) clearInterval(state.poller);
		state.poller = null;
		for (const timer of state.cleanupTimers.values()) clearTimeout(timer);
		state.cleanupTimers.clear();
		state.asyncJobs.clear();
		clearSlashSnapshots();
		slashBridge.cancelAll();
		slashBridge.dispose();
		promptTemplateBridge.cancelAll();
		promptTemplateBridge.dispose();
		if (state.lastUiContext?.hasUI) state.lastUiContext.ui.setWidget(WIDGET_KEY, undefined);
	});
}
