import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { formatExitMessage } from "./formatExitMessage.js";
import { setExitMessage } from "./state/setExitMessage.js";

/**
 * Refreshes the queued exit message from the current session title.
 *
 * @param pi Pi extension API.
 */
export function updateExitMessageFromSessionTitle(pi: ExtensionAPI): void {
	setExitMessage(formatExitMessage(pi.getSessionName()));
}
