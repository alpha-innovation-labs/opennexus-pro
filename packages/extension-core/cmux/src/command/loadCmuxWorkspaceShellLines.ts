import { refreshCmuxWorkspaceShellLinesCache } from "../workspace-cache/refreshCmuxWorkspaceShellLinesCache";

/**
 * Loads display lines for the cmux workspace shell modal.
 *
 * @returns Workspace shell lines with Nexus session substitutions.
 */
export async function loadCmuxWorkspaceShellLines(): Promise<string[]> {
	return refreshCmuxWorkspaceShellLinesCache();
}
