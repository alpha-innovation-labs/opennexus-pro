import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { formatExitMessage } from "./formatExitMessage";
import { setExitMessage } from "./state/setExitMessage";

/**
 * Refreshes the queued exit message from the current session id and title.
 *
 * @param pi Pi extension API.
 * @param ctx Optional extension context containing the session manager.
 */
export function updateExitMessageFromSessionTitle(pi: ExtensionAPI, ctx?: Pick<ExtensionContext, "sessionManager">): void {
	setExitMessage(formatExitMessage({ sessionId: ctx?.sessionManager.getSessionId(), title: pi.getSessionName() }));
}
