import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { getObservationMessagesPath } from "../shared/getObservationMessagesPath.js";
import { getObservationStatePath } from "../shared/getObservationStatePath.js";
import { getObservationsDir } from "../shared/getObservationsDir.js";
import { getObservationsMarkdownPath } from "../shared/getObservationsMarkdownPath.js";
import { getTrackedConversationId } from "./getTrackedConversationId.js";

/**
 * Resolves all storage paths needed by the observations tracker.
 *
 * @param ctx Pi extension context.
 * @param ephemeralConversationId Ephemeral fallback identifier.
 * @returns Observation identifiers and paths.
 */
export function getObservationPaths(
	ctx: ExtensionContext,
	ephemeralConversationId: string,
): {
	conversationId: string;
	sessionFile: string | null;
	dir: string;
	messagesPath: string;
	statePath: string;
	markdownPath: string;
} {
	const sessionFile = ctx.sessionManager.getSessionFile();
	const conversationId = getTrackedConversationId(sessionFile ?? null, ephemeralConversationId);
	return {
		conversationId,
		sessionFile: sessionFile ?? null,
		dir: getObservationsDir(),
		messagesPath: getObservationMessagesPath(conversationId),
		statePath: getObservationStatePath(conversationId),
		markdownPath: getObservationsMarkdownPath(conversationId),
	};
}
