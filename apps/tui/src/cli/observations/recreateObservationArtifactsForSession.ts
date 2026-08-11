import { mkdir } from "node:fs/promises";
import type { SessionInfo } from "@earendil-works/pi-coding-agent";
import { getObservationsDir } from "@extensions/observations/shared/getObservationsDir";
import { writeObservationState } from "@extensions/observations/tracker/writeObservationState";
import { createObservationArtifactPaths } from "./createObservationArtifactPaths";
import { createObservationMessagesFromSessionEntries } from "./createObservationMessagesFromSessionEntries";
import { createObservationStateFromMessages } from "./createObservationStateFromMessages";
import { deleteObservationArtifactsForSessionPath } from "./deleteObservationArtifactsForSessionPath";
import { getConversationIdFromSessionPath } from "./getConversationIdFromSessionPath";
import { readSessionEntries } from "./readSessionEntries";

/**
 * Recreates observation artifacts for one persisted session from JSONL.
 *
 * @param session Session metadata.
 */
export async function recreateObservationArtifactsForSession(
	session: SessionInfo,
): Promise<void> {
	await mkdir(getObservationsDir(), { recursive: true });
	await deleteObservationArtifactsForSessionPath(session.path);
	const conversationId = getConversationIdFromSessionPath(session.path);
	const entries = await readSessionEntries(session.path);
	const messages = createObservationMessagesFromSessionEntries(entries);
	const paths = createObservationArtifactPaths(conversationId);
	const state = await createObservationStateFromMessages(
		conversationId,
		session.cwd,
		session.path,
		messages,
	);
	await writeObservationState(paths.statePath, state);
}
