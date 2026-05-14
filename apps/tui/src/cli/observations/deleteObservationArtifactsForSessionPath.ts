import { deleteObservationArtifacts } from "./deleteObservationArtifacts.js";
import { getConversationIdFromSessionPath } from "./getConversationIdFromSessionPath.js";

/**
 * Deletes observation artifacts associated with a session file path.
 *
 * @param sessionPath Persisted session JSONL path.
 * @returns Number of deleted groups.
 */
export async function deleteObservationArtifactsForSessionPath(sessionPath: string): Promise<number> {
  return deleteObservationArtifacts(getConversationIdFromSessionPath(sessionPath));
}
