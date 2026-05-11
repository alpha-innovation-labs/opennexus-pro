import { readLiveCmuxSessionRegistryEntries } from "../session-registry/readLiveCmuxSessionRegistryEntries.js";
import { collectCmuxWorkspaceShells } from "../workspaces/collectCmuxWorkspaceShells.js";
import { createCmuxWorkspaceShellLines } from "../workspaces/createCmuxWorkspaceShellLines.js";
import { createCmuxSavedSession } from "./createCmuxSavedSession.js";
import { createCmuxSavedWorkspaces } from "./createCmuxSavedWorkspaces.js";
import { getCmuxSavedSessionsPath } from "./getCmuxSavedSessionsPath.js";
import { readCmuxSavedSessionStore } from "./readCmuxSavedSessionStore.js";
import { writeCmuxSavedSessionStore } from "./writeCmuxSavedSessionStore.js";

/**
 * Saves the current cmux workspace/pane snapshot with a user name.
 *
 * @param name User-visible snapshot name.
 */
export async function saveCmuxSessionSnapshot(name: string): Promise<void> {
	const storePath = getCmuxSavedSessionsPath();
	const store = await readCmuxSavedSessionStore(storePath);
	const [view, registrations] = await Promise.all([
		collectCmuxWorkspaceShells(),
		readLiveCmuxSessionRegistryEntries(),
	]);
	const snapshot = createCmuxSavedSession(
		name,
		createCmuxWorkspaceShellLines(view, registrations),
		createCmuxSavedWorkspaces(view, registrations),
	);
	await writeCmuxSavedSessionStore(storePath, { version: 1, sessions: [snapshot, ...store.sessions] });
}
