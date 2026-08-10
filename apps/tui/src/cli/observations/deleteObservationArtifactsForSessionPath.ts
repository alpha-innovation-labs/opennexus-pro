import { deleteKnownObservationArtifactsForConversationId } from "./deleteKnownObservationArtifactsForConversationId";
import { getConversationIdFromSessionPath } from "./getConversationIdFromSessionPath";

/**
 * Deletes observation artifacts associated with a session file path.
 *
 * @param sessionPath Persisted session JSONL path.
 * @returns Number of deleted groups.
 */
export async function deleteObservationArtifactsForSessionPath(sessionPath: string): Promise<number> {
  return deleteKnownObservationArtifactsForConversationId(getConversationIdFromSessionPath(sessionPath));
}
