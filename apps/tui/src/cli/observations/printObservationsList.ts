import { getObservationsDir } from "@extensions/observations/shared/getObservationsDir";
import { readObservationState } from "@extensions/observations/tracker/readObservationState";
import { formatObservationTopicList } from "./formatObservationTopicList";
import { listObservationArtifactGroups } from "./listObservationArtifactGroups";
import { resolveObservationConversationId } from "./resolveObservationConversationId";
import { selectObservationArtifactGroups } from "./selectObservationArtifactGroups";

/**
 * Prints persisted observations for a session id to stdout.
 *
 * @param sessionId Persisted session identifier.
 * @param cwd Current working directory used for state fallback metadata.
 */
export async function printObservationsList(
	sessionId: string,
	cwd: string,
): Promise<void> {
	const conversationId = await resolveObservationConversationId(sessionId);
	const groups = selectObservationArtifactGroups(
		await listObservationArtifactGroups(getObservationsDir()),
		conversationId,
	);
	const statePath = groups[0]?.statePath ?? groups[0]?.legacyStatePath;
	const state = await readObservationState(
		statePath ?? "",
		conversationId,
		cwd,
		null,
	);
	console.log(formatObservationTopicList(state));
}
