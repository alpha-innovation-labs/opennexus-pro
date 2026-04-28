import { matchesCmuxSurfaceRegistration } from "./matchesCmuxSurfaceRegistration.js";
import { pruneCmuxSessionRegistryEntries } from "./pruneCmuxSessionRegistryEntries.js";
import type { CmuxSessionRegistry } from "./types.js";

/**
 * Removes one cmux surface registration from a registry object.
 *
 * @param registry Existing registry.
 * @param workspaceId Workspace identifier to remove.
 * @param surfaceId Surface identifier to remove.
 * @returns Updated registry.
 */
export function removeCmuxSessionRegistryEntry(registry: CmuxSessionRegistry, workspaceId: string | undefined, surfaceId: string): CmuxSessionRegistry {
	const entries = pruneCmuxSessionRegistryEntries(registry.entries).filter((entry) => !matchesCmuxSurfaceRegistration(entry, workspaceId, surfaceId));
	return { version: 1, entries };
}
