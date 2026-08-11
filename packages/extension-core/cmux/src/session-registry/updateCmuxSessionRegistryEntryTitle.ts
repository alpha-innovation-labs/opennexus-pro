import { matchesCmuxSurfaceRegistration } from "./matchesCmuxSurfaceRegistration";
import { normalizeCmuxSessionTitle } from "./normalizeCmuxSessionTitle";
import { pruneCmuxSessionRegistryEntries } from "./pruneCmuxSessionRegistryEntries";
import type { CmuxSessionRegistry } from "./types";

/**
 * Updates the stored Nexus session title for one cmux surface registration.
 *
 * @param registry Existing registry.
 * @param workspaceId Workspace identifier to update.
 * @param surfaceId Surface identifier to update.
 * @param sessionTitle Latest Nexus session title.
 * @returns Updated registry.
 */
export function updateCmuxSessionRegistryEntryTitle(
	registry: CmuxSessionRegistry,
	workspaceId: string | undefined,
	surfaceId: string,
	sessionTitle: string,
): CmuxSessionRegistry {
	const normalizedTitle = normalizeCmuxSessionTitle(sessionTitle);
	const entries = pruneCmuxSessionRegistryEntries(registry.entries).map(
		(entry) => {
			if (!matchesCmuxSurfaceRegistration(entry, workspaceId, surfaceId))
				return entry;
			return {
				...entry,
				sessionTitle: normalizedTitle,
				updatedAt: new Date().toISOString(),
			};
		},
	);
	return { version: 1, entries };
}
