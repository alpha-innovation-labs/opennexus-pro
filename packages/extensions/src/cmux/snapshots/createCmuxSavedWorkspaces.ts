import { findRegisteredNexusSession } from "../session-registry/findRegisteredNexusSession.js";
import type { CmuxSessionRegistryEntry } from "../session-registry/types.js";
import { getCmuxSurfaceIdentifier } from "../workspaces/getCmuxSurfaceIdentifier.js";
import { getCmuxWorkspaceIdentifier } from "../workspaces/getCmuxWorkspaceIdentifier.js";
import type { CmuxWorkspaceShellView } from "../workspaces/types.js";
import type { CmuxSavedWorkspace } from "./types.js";

/**
 * Creates structured saved workspaces with Nexus session ids for future restore.
 *
 * @param view Current cmux workspace shell view.
 * @param registrations Live Nexus session registrations.
 * @returns Structured workspace snapshot.
 */
export function createCmuxSavedWorkspaces(view: CmuxWorkspaceShellView, registrations: CmuxSessionRegistryEntry[]): CmuxSavedWorkspace[] {
	return view.workspaces.map((workspace) => {
		const workspaceId = getCmuxWorkspaceIdentifier(workspace);
		return {
			title: workspace.title,
			panes: workspace.panes.flatMap((pane) => pane.surfaces.map((surface) => {
				const registration = findRegisteredNexusSession(registrations, workspaceId, getCmuxSurfaceIdentifier(surface));
				return {
					title: surface.title,
					sessionId: registration?.sessionId,
					sessionTitle: registration?.sessionTitle,
				};
			})),
		};
	});
}
