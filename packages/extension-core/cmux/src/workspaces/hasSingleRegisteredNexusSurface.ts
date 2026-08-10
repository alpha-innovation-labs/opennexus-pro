import { findRegisteredNexusSession } from "../session-registry/findRegisteredNexusSession";
import type { CmuxSessionRegistryEntry } from "../session-registry/types";
import { getCmuxSurfaceIdentifier } from "./getCmuxSurfaceIdentifier";
import { getCmuxWorkspaceIdentifier } from "./getCmuxWorkspaceIdentifier";
import type { CmuxWorkspace } from "./types";

/**
 * Checks whether a workspace contains exactly one surface and it is a Nexus session.
 *
 * @param workspace cmux workspace.
 * @param registrations Live Nexus session registrations.
 * @returns True when the only workspace surface is a registered Nexus session.
 */
export function hasSingleRegisteredNexusSurface(workspace: CmuxWorkspace, registrations: CmuxSessionRegistryEntry[]): boolean {
	const surfaces = workspace.panes.flatMap((pane) => pane.surfaces);
	if (surfaces.length !== 1) return false;
	return findRegisteredNexusSession(registrations, getCmuxWorkspaceIdentifier(workspace), getCmuxSurfaceIdentifier(surfaces[0])) !== undefined;
}
