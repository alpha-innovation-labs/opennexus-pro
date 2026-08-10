import { getCmuxTitleSyncEnabled } from "./state/getCmuxTitleSyncEnabled.js";
import { renameCurrentCmuxSurface } from "./runtime/renameCurrentCmuxSurface.js";
import { renameCurrentCmuxWorkspace } from "./runtime/renameCurrentCmuxWorkspace.js";
import { updateCurrentNexusSessionTitle } from "./session-registry/updateCurrentNexusSessionTitle.js";
import { formatCmuxNexusTitle } from "./workspaces/formatCmuxNexusTitle.js";

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
