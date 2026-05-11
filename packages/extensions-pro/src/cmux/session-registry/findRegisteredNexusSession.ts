import { matchesCmuxSurfaceRegistration } from "./matchesCmuxSurfaceRegistration.js";
import type { CmuxSessionRegistryEntry } from "./types.js";

/**
 * Finds the Nexus session registered for a cmux surface.
 *
 * @param entries Registry entries.
 * @param workspaceId Workspace identifier from cmux.
 * @param surfaceId Surface identifier from cmux.
 * @returns Matching Nexus registry entry, when present.
 */
export function findRegisteredNexusSession(entries: CmuxSessionRegistryEntry[], workspaceId: string | undefined, surfaceId: string): CmuxSessionRegistryEntry | undefined {
	return entries.find((entry) => matchesCmuxSurfaceRegistration(entry, workspaceId, surfaceId));
}
