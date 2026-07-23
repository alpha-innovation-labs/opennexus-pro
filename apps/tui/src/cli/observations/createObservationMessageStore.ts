import type { ObservationMessageStore, StoredObservationMessage } from "@nexus/extensions/observations/tracker/types.js";

/**
 * Creates a persisted observation message store payload.
 *
 * @param conversationId Observation conversation id.
 * @param cwd Session working directory.
 * @param sessionFile Session file path.
 * @param messages Stored observation messages.
 * @returns Message store payload.
 */
export function createObservationMessageStore(
  conversationId: string,
  cwd: string,
  sessionFile: string,
  messages: readonly StoredObservationMessage[],
): ObservationMessageStore {
  return {
    conversationId,
    cwd,
    sessionFile,
    updatedAt: Date.now(),
    messages: [...messages],
  };
}
