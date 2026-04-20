import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { updateExitMessageFromSessionTitle } from "./updateExitMessageFromSessionTitle.js";

/**
 * Captures the current session title so it can be printed after shutdown.
 *
 * @param pi Pi extension API.
 */
export function registerExitMessageExtension(pi: ExtensionAPI): void {
	pi.on("session_start", () => {
		updateExitMessageFromSessionTitle(pi);
	});
	pi.on("turn_end", () => {
		updateExitMessageFromSessionTitle(pi);
	});
	pi.on("session_shutdown", (_event, ctx) => {
		if (!ctx.hasUI) return;
		updateExitMessageFromSessionTitle(pi);
	});
}
