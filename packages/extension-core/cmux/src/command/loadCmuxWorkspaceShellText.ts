import { readLiveCmuxSessionRegistryEntries } from "../session-registry/readLiveCmuxSessionRegistryEntries.js";
import { collectCmuxWorkspaceShells } from "../workspaces/collectCmuxWorkspaceShells.js";
import { formatCmuxWorkspaceShells } from "../workspaces/formatCmuxWorkspaceShells.js";

/**
 * Loads plain text for non-interactive cmux workspace output.
 *
 * @returns Workspace shell text with Nexus session substitutions.
 */
export async function loadCmuxWorkspaceShellText(): Promise<string> {
	const [view, registrations] = await Promise.all([
		collectCmuxWorkspaceShells(),
		readLiveCmuxSessionRegistryEntries(),
	]);
	return formatCmuxWorkspaceShells(view, registrations);
}
