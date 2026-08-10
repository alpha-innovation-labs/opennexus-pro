import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getObservationStatePath } from "../shared/getObservationStatePath";
import { getObservationsDir } from "../shared/getObservationsDir";
import { getTrackedConversationId } from "./getTrackedConversationId";

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
	statePath: string;
} {
	const sessionFile = ctx.sessionManager.getSessionFile();
	const conversationId = getTrackedConversationId(sessionFile ?? null, ephemeralConversationId);
	return {
		conversationId,
		sessionFile: sessionFile ?? null,
		dir: getObservationsDir(),
		statePath: getObservationStatePath(conversationId),
	};
}
