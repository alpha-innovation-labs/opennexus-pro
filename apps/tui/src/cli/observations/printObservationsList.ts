import { readObservationState } from "@nexus/extensions-pro/observations/tracker/readObservationState.js";
import { getObservationStatePath } from "@nexus/extensions-pro/observations/shared/getObservationStatePath.js";
import { formatObservationTopicList } from "./formatObservationTopicList.js";
import { resolveObservationConversationId } from "./resolveObservationConversationId.js";

/**
 * Prints persisted observations for a session id to stdout.
 *
 * @param sessionId Persisted session identifier.
 * @param cwd Current working directory used for state fallback metadata.
 */
export async function printObservationsList(sessionId: string, cwd: string): Promise<void> {
	const conversationId = await resolveObservationConversationId(sessionId);
	const statePath = getObservationStatePath(conversationId);
	const state = await readObservationState(statePath, conversationId, cwd, null);
	console.log(formatObservationTopicList(state));
}
