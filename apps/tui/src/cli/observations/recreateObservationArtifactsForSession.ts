import { mkdir } from "node:fs/promises";
import { getObservationsDir } from "@extensions/observations/shared/getObservationsDir.js";
import { writeObservationState } from "@extensions/observations/tracker/writeObservationState.js";
import type { SessionInfo } from "@earendil-works/pi-coding-agent";
import { createObservationArtifactPaths } from "./createObservationArtifactPaths.js";
import { createObservationMessagesFromSessionEntries } from "./createObservationMessagesFromSessionEntries.js";
import { createObservationStateFromMessages } from "./createObservationStateFromMessages.js";
import { deleteObservationArtifactsForSessionPath } from "./deleteObservationArtifactsForSessionPath.js";
import { getConversationIdFromSessionPath } from "./getConversationIdFromSessionPath.js";
import { readSessionEntries } from "./readSessionEntries.js";

/**
 * Recreates observation artifacts for one persisted session from JSONL.
 *
 * @param session Session metadata.
 */
export async function recreateObservationArtifactsForSession(session: SessionInfo): Promise<void> {
  await mkdir(getObservationsDir(), { recursive: true });
  await deleteObservationArtifactsForSessionPath(session.path);
  const conversationId = getConversationIdFromSessionPath(session.path);
  const entries = await readSessionEntries(session.path);
  const messages = createObservationMessagesFromSessionEntries(entries);
  const paths = createObservationArtifactPaths(conversationId);
  const state = await createObservationStateFromMessages(conversationId, session.cwd, session.path, messages);
  await writeObservationState(paths.statePath, state);
}
