import { getCmuxSavedSessionsPath } from "./getCmuxSavedSessionsPath.js";
import { readCmuxSavedSessionStore } from "./readCmuxSavedSessionStore.js";
import type { CmuxSavedSession } from "./types.js";

/**
 * Lists saved cmux session snapshots.
 *
 * @returns Saved session snapshots, newest first.
 */
export async function listCmuxSavedSessions(): Promise<CmuxSavedSession[]> {
	const store = await readCmuxSavedSessionStore(getCmuxSavedSessionsPath());
	return [...store.sessions].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
