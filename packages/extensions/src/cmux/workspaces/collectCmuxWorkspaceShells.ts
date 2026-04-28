import { listCmuxPaneSurfaces } from "./listCmuxPaneSurfaces.js";
import { listCmuxPanes } from "./listCmuxPanes.js";
import { listCmuxWorkspaces } from "./listCmuxWorkspaces.js";
import type { CmuxWorkspaceShellView } from "./types.js";

/**
 * Collects cmux workspaces, panes, and shells into one view model.
 *
 * @returns Current cmux workspace shell view.
 */
export async function collectCmuxWorkspaceShells(): Promise<CmuxWorkspaceShellView> {
	const workspaces = await listCmuxWorkspaces();
	for (const workspace of workspaces) {
		workspace.panes = await listCmuxPanes(workspace.ref);
		for (const pane of workspace.panes) {
			pane.surfaces = await listCmuxPaneSurfaces(workspace.ref, pane.ref);
		}
	}
	return { workspaces };
}
