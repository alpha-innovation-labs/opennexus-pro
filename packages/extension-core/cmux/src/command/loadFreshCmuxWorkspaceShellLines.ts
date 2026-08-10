import { readLiveCmuxSessionRegistryEntries } from "../session-registry/readLiveCmuxSessionRegistryEntries";
import { collectCmuxWorkspaceShells } from "../workspaces/collectCmuxWorkspaceShells";
import { createCmuxWorkspaceShellLines } from "../workspaces/createCmuxWorkspaceShellLines";

/**
 * Loads fresh display lines for the cmux workspace shell modal.
 *
 * @returns Workspace shell lines with Nexus session substitutions.
 */
export async function loadFreshCmuxWorkspaceShellLines(): Promise<string[]> {
	const [view, registrations] = await Promise.all([
		collectCmuxWorkspaceShells(),
		readLiveCmuxSessionRegistryEntries(),
	]);
	return createCmuxWorkspaceShellLines(view, registrations);
}
