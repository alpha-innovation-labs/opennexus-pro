import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerCmuxCommand } from "./command/registerCmuxCommand";
import { notifyCmuxPaneCompletion } from "./notifyCmuxPaneCompletion";
import { registerCurrentNexusSession } from "./session-registry/registerCurrentNexusSession";
import { setCmuxTitleSyncEnabled } from "./state/setCmuxTitleSyncEnabled";

/**
 * Enables cmux pane-title syncing and pane-done notifications.
 *
 * @param pi Pi extension API.
 */
export function registerCmuxExtension(pi: ExtensionAPI): void {
	setCmuxTitleSyncEnabled(true);
	registerCmuxCommand(pi);
	pi.on("session_start", async (_event, ctx) => {
		await registerCurrentNexusSession(
			ctx.sessionManager.getSessionId(),
			ctx.sessionManager.getSessionFile(),
			pi.getSessionName() ?? ctx.sessionManager.getSessionName?.(),
		);
	});
	pi.on("agent_end", async () => {
		await notifyCmuxPaneCompletion(pi.getSessionName() ?? "");
	});
	pi.on("session_shutdown", () => {
		setCmuxTitleSyncEnabled(false);
	});
}
