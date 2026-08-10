import { getCmuxTitleSyncEnabled } from "./state/getCmuxTitleSyncEnabled";
import { renameCurrentCmuxSurface } from "./runtime/renameCurrentCmuxSurface";
import { renameCurrentCmuxWorkspace } from "./runtime/renameCurrentCmuxWorkspace";
import { updateCurrentNexusSessionTitle } from "./session-registry/updateCurrentNexusSessionTitle";
import { formatCmuxNexusTitle } from "./workspaces/formatCmuxNexusTitle";

/**
 * Mirrors the current Nexus session title into the active cmux surface title.
 *
 * @param sessionTitle Current Nexus session title.
 */
export async function syncCmuxPaneTitle(sessionTitle: string): Promise<void> {
	const title = sessionTitle.replace(/\s+/g, " ").trim();
	if (!title || !getCmuxTitleSyncEnabled()) return;
	const cmuxWorkspaceTitle = formatCmuxNexusTitle(title);
	await renameCurrentCmuxSurface(title);
	await renameCurrentCmuxWorkspace(cmuxWorkspaceTitle);
	await updateCurrentNexusSessionTitle(title);
}
