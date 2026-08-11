import { matchesCmuxSurfaceRegistration } from "./matchesCmuxSurfaceRegistration";
import { pruneCmuxSessionRegistryEntries } from "./pruneCmuxSessionRegistryEntries";
import type { CmuxSessionRegistry } from "./types";

/**
 * Removes one cmux surface registration from a registry object.
 *
 * @param registry Existing registry.
 * @param workspaceId Workspace identifier to remove.
 * @param surfaceId Surface identifier to remove.
 * @returns Updated registry.
 */
export function removeCmuxSessionRegistryEntry(
	registry: CmuxSessionRegistry,
	workspaceId: string | undefined,
	surfaceId: string,
): CmuxSessionRegistry {
	const entries = pruneCmuxSessionRegistryEntries(registry.entries).filter(
		(entry) => !matchesCmuxSurfaceRegistration(entry, workspaceId, surfaceId),
	);
	return { version: 1, entries };
}
