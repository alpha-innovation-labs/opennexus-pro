import type { CmuxSessionRegistryEntry } from "../session-registry/types";
import { formatCmuxNexusTitle } from "./formatCmuxNexusTitle";
import { hasSingleRegisteredNexusSurface } from "./hasSingleRegisteredNexusSurface";
import type { CmuxWorkspace } from "./types";

/**
 * Formats a workspace title, using the Nexus icon for single-session Nexus workspaces.
 *
 * @param workspace cmux workspace.
 * @param registrations Live Nexus session registrations.
 * @returns Display title for the workspace row.
 */
export function formatCmuxWorkspaceTitle(workspace: CmuxWorkspace, registrations: CmuxSessionRegistryEntry[]): string {
	if (!hasSingleRegisteredNexusSurface(workspace, registrations)) return workspace.title;
	return formatCmuxNexusTitle(workspace.title.replace(/^π\s*/, ""));
}
