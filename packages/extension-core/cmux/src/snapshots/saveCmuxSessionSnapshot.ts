import { readLiveCmuxSessionRegistryEntries } from "../session-registry/readLiveCmuxSessionRegistryEntries";
import { collectCmuxWorkspaceShells } from "../workspaces/collectCmuxWorkspaceShells";
import { createCmuxWorkspaceShellLines } from "../workspaces/createCmuxWorkspaceShellLines";
import { createCmuxSavedSession } from "./createCmuxSavedSession";
import { createCmuxSavedWorkspaces } from "./createCmuxSavedWorkspaces";
import { getCmuxSavedSessionsPath } from "./getCmuxSavedSessionsPath";
import { readCmuxSavedSessionStore } from "./readCmuxSavedSessionStore";
import { writeCmuxSavedSessionStore } from "./writeCmuxSavedSessionStore";

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
	await writeCmuxSavedSessionStore(storePath, {
		version: 1,
		sessions: [snapshot, ...store.sessions],
	});
}
