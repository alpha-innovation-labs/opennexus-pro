import type { CmuxSessionRegistryEntry } from "./types";

/**
 * Checks whether a registry entry belongs to a cmux workspace surface.
 *
 * @param entry Registry entry.
 * @param workspaceId Workspace identifier from cmux.
 * @param surfaceId Surface identifier from cmux.
 * @returns True when the entry targets the workspace surface.
 */
export function matchesCmuxSurfaceRegistration(
	entry: CmuxSessionRegistryEntry,
	workspaceId: string | undefined,
	surfaceId: string,
): boolean {
	return (
		entry.surfaceId === surfaceId &&
		(!workspaceId || !entry.workspaceId || entry.workspaceId === workspaceId)
	);
}
