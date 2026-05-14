/**
 * Extracts the user-facing session id from an observation conversation id.
 *
 * @param conversationId Observation conversation id.
 * @returns Session id suffix or the original conversation id.
 */
export function getObservationSessionId(conversationId: string): string {
  if (conversationId.startsWith("ephemeral-")) return conversationId;
  const separatorIndex = conversationId.lastIndexOf("_");
  return separatorIndex >= 0 ? conversationId.slice(separatorIndex + 1) : conversationId;
}
