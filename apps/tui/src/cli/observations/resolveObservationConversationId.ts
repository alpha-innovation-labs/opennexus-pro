import { getObservationsDir } from "@extensions/observations/shared/getObservationsDir";
import { sanitizeConversationId } from "@extensions/observations/shared/sanitizeConversationId";
import { findObservationStateConversationId } from "./findObservationStateConversationId";

/**
 * Resolves a CLI session id to the stored observation conversation id.
 *
 * @param sessionId Session id or full observation conversation id.
 * @returns Conversation id used by observation state files.
 */
export async function resolveObservationConversationId(
	sessionId: string,
): Promise<string> {
	const sanitizedSessionId = sanitizeConversationId(sessionId);
	return (
		(await findObservationStateConversationId(
			getObservationsDir(),
			sanitizedSessionId,
		)) ?? sanitizedSessionId
	);
}
