import { mkdir } from "node:fs/promises";
import { getObservationsDir } from "@nexus/extensions-pro/observations/shared/getObservationsDir.js";
import { writeObservationState } from "@nexus/extensions-pro/observations/tracker/writeObservationState.js";
import { writeObservationsMarkdown } from "@nexus/extensions-pro/observations/tracker/writeObservationsMarkdown.js";
import type { SessionInfo } from "@earendil-works/pi-coding-agent";
import { createObservationArtifactPaths } from "./createObservationArtifactPaths.js";
import { createObservationMessagesFromSessionEntries } from "./createObservationMessagesFromSessionEntries.js";
import { createObservationMessageStore } from "./createObservationMessageStore.js";
import { createObservationStateFromMessages } from "./createObservationStateFromMessages.js";
import { deleteObservationArtifactsForSessionPath } from "./deleteObservationArtifactsForSessionPath.js";
import { getConversationIdFromSessionPath } from "./getConversationIdFromSessionPath.js";
import { readSessionEntries } from "./readSessionEntries.js";
import { writeObservationMessageStore } from "./writeObservationMessageStore.js";

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
  const store = createObservationMessageStore(conversationId, session.cwd, session.path, messages);
  const state = await createObservationStateFromMessages(conversationId, session.cwd, session.path, messages);
  await writeObservationMessageStore(paths.messagesPath, store);
  await writeObservationState(paths.statePath, state);
  await writeObservationsMarkdown(paths.markdownPath, state);
}
