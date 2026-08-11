import { getCmuxSavedSessionsPath } from "./getCmuxSavedSessionsPath";
import { readCmuxSavedSessionStore } from "./readCmuxSavedSessionStore";
import { writeCmuxSavedSessionStore } from "./writeCmuxSavedSessionStore";

/**
 * Deletes a saved cmux session snapshot by id.
 *
 * @param sessionId Saved session id to delete.
 */
export async function deleteCmuxSavedSession(sessionId: string): Promise<void> {
	const storePath = getCmuxSavedSessionsPath();
	const store = await readCmuxSavedSessionStore(storePath);
	await writeCmuxSavedSessionStore(storePath, {
		version: 1,
		sessions: store.sessions.filter((session) => session.id !== sessionId),
	});
}
