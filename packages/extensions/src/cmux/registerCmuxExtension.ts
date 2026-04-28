import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerCmuxCommand } from "./command/registerCmuxCommand.js";
import { notifyCmuxPaneCompletion } from "./notifyCmuxPaneCompletion.js";
import { registerCurrentNexusSession } from "./session-registry/registerCurrentNexusSession.js";
import { unregisterCurrentNexusSession } from "./session-registry/unregisterCurrentNexusSession.js";
import { setCmuxTitleSyncEnabled } from "./state/setCmuxTitleSyncEnabled.js";

/**
 * Enables cmux pane-title syncing and pane-done notifications.
 *
 * @param pi Pi extension API.
 */
export function registerCmuxExtension(pi: ExtensionAPI): void {
	setCmuxTitleSyncEnabled(true);
	registerCmuxCommand(pi);
	pi.on("session_start", async (_event, ctx) => {
		await registerCurrentNexusSession(ctx.sessionManager.getSessionId(), ctx.sessionManager.getSessionFile(), pi.getSessionName() ?? ctx.sessionManager.getSessionName?.());
	});
	pi.on("agent_end", async () => {
		await notifyCmuxPaneCompletion(pi.getSessionName() ?? "");
	});
	pi.on("session_shutdown", async () => {
		setCmuxTitleSyncEnabled(false);
		await unregisterCurrentNexusSession();
	});
}
