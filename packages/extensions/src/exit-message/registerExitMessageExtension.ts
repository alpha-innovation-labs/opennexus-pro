import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { clearExitMessage } from "./state/clearExitMessage.js";
import { hasRealSessionMessages } from "./hasRealSessionMessages.js";
import { updateExitMessageFromSessionTitle } from "./updateExitMessageFromSessionTitle.js";

/**
 * Captures the current session resume command and title so they can be printed after shutdown.
 *
 * @param pi Pi extension API.
 */
export function registerExitMessageExtension(pi: ExtensionAPI): void {
	let sawTurn = false;
	pi.on("turn_end", (_event, ctx) => {
		sawTurn = true;
		updateExitMessageFromSessionTitle(pi, ctx);
	});
	pi.on("session_shutdown", (_event, ctx) => {
		if (!ctx.hasUI) return;
		if (!sawTurn && !hasRealSessionMessages(ctx)) {
			clearExitMessage();
			return;
		}
		updateExitMessageFromSessionTitle(pi, ctx);
	});
}
