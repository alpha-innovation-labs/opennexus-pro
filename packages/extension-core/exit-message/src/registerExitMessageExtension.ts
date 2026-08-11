import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { hasRealSessionMessages } from "./hasRealSessionMessages";
import { clearExitMessage } from "./state/clearExitMessage";
import { updateExitMessageFromSessionTitle } from "./updateExitMessageFromSessionTitle";

/**
 * Captures the current session resume command and title so they can be printed after shutdown.
 *
 * @param pi Pi extension API.
 */
export function registerExitMessageExtension(pi: ExtensionAPI): void {
	let sawTurn = false;
	pi.on("turn_end", (_event, ctx) => {
		if (!ctx.hasUI) return;
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
