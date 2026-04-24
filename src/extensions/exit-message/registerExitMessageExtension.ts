import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { updateExitMessageFromSessionTitle } from "./updateExitMessageFromSessionTitle.js";

/**
 * Captures the current session resume command and title so they can be printed after shutdown.
 *
 * @param pi Pi extension API.
 */
export function registerExitMessageExtension(pi: ExtensionAPI): void {
	pi.on("session_start", (_event, ctx) => {
		updateExitMessageFromSessionTitle(pi, ctx);
	});
	pi.on("turn_end", (_event, ctx) => {
		updateExitMessageFromSessionTitle(pi, ctx);
	});
	pi.on("session_shutdown", (_event, ctx) => {
		if (!ctx.hasUI) return;
		updateExitMessageFromSessionTitle(pi, ctx);
	});
}
