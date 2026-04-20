import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { notifyCmuxPaneCompletion } from "./notifyCmuxPaneCompletion.js";
import { setCmuxTitleSyncEnabled } from "./state/setCmuxTitleSyncEnabled.js";

/**
 * Enables cmux pane-title syncing and pane-done notifications.
 *
 * @param pi Pi extension API.
 */
export function registerCmuxExtension(pi: ExtensionAPI): void {
	setCmuxTitleSyncEnabled(true);
	pi.on("agent_end", async () => {
		await notifyCmuxPaneCompletion(pi.getSessionName() ?? "");
	});
	pi.on("session_shutdown", () => {
		setCmuxTitleSyncEnabled(false);
	});
}
