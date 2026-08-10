import { getCmuxSavedSessionsPath } from "./getCmuxSavedSessionsPath";
import { readCmuxSavedSessionStore } from "./readCmuxSavedSessionStore";
import type { CmuxSavedSession } from "./types";

/**
 * Lists saved cmux session snapshots.
 *
 * @returns Saved session snapshots, newest first.
 */
export async function listCmuxSavedSessions(): Promise<CmuxSavedSession[]> {
	const store = await readCmuxSavedSessionStore(getCmuxSavedSessionsPath());
	return [...store.sessions].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
