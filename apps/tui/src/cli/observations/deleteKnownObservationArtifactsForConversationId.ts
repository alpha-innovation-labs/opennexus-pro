import { createKnownObservationArtifactPaths } from "./createKnownObservationArtifactPaths.js";
import { deleteObservationArtifactFileIfPresent } from "./deleteObservationArtifactFileIfPresent.js";

/**
 * Deletes known observation artifacts for one conversation without listing observation storage.
 *
 * @param conversationId Session-derived observation conversation id.
 * @returns Number of deleted observation groups.
 */
export async function deleteKnownObservationArtifactsForConversationId(conversationId: string): Promise<number> {
  const paths = createKnownObservationArtifactPaths(conversationId);
  const deletedFiles = await Promise.all(paths.map((path) => deleteObservationArtifactFileIfPresent(path)));
  return deletedFiles.some(Boolean) ? 1 : 0;
}
