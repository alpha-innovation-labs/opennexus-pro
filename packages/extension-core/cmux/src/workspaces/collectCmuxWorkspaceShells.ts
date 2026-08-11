import { listCmuxPaneSurfaces } from "./listCmuxPaneSurfaces";
import { listCmuxPanes } from "./listCmuxPanes";
import { listCmuxWorkspaces } from "./listCmuxWorkspaces";
import type { CmuxWorkspaceShellView } from "./types";

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
