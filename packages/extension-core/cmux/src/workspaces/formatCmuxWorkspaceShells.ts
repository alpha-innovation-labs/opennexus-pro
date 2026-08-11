import { findRegisteredNexusSession } from "../session-registry/findRegisteredNexusSession";
import type { CmuxSessionRegistryEntry } from "../session-registry/types";
import { formatCmuxSurfaceLabel } from "./formatCmuxSurfaceLabel";
import { formatCmuxWorkspaceTitle } from "./formatCmuxWorkspaceTitle";
import { getCmuxSurfaceIdentifier } from "./getCmuxSurfaceIdentifier";
import { getCmuxWorkspaceIdentifier } from "./getCmuxWorkspaceIdentifier";
import type { CmuxWorkspaceShellView } from "./types";

/**
 * Formats the cmux workspace shell view for display in Nexus.
 *
 * @param view Collected cmux workspace shell view.
 * @param registrations Live Nexus session registrations.
 * @returns Multiline workspace shell summary.
 */
export function formatCmuxWorkspaceShells(
	view: CmuxWorkspaceShellView,
	registrations: CmuxSessionRegistryEntry[],
): string {
	if (view.workspaces.length === 0) return "No cmux workspaces found.";
	const lines = ["cmux workspaces"];
	for (const workspace of view.workspaces) {
		const workspaceId = getCmuxWorkspaceIdentifier(workspace);
		lines.push(formatCmuxWorkspaceTitle(workspace, registrations));
		for (const pane of workspace.panes) {
			for (const surface of pane.surfaces) {
				const surfaceId = getCmuxSurfaceIdentifier(surface);
				const registration = findRegisteredNexusSession(
					registrations,
					workspaceId,
					surfaceId,
				);
				lines.push(`  ${formatCmuxSurfaceLabel(surface, registration)}`);
			}
			if (pane.surfaces.length === 0) lines.push("  No shells");
		}
		if (workspace.panes.length === 0) lines.push("  No panes");
	}
	return lines.join("\n");
}
