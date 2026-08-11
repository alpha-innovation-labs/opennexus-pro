import { getCurrentCmuxRenameTarget } from "../runtime/getCurrentCmuxRenameTarget";
import { getCmuxSessionRegistryPath } from "./getCmuxSessionRegistryPath";
import { matchesCmuxSurfaceRegistration } from "./matchesCmuxSurfaceRegistration";
import { readCmuxSessionRegistry } from "./readCmuxSessionRegistry";
import { updateCmuxSessionRegistryEntryTitle } from "./updateCmuxSessionRegistryEntryTitle";
import { withCmuxSessionRegistryLock } from "./withCmuxSessionRegistryLock";
import { writeCmuxSessionRegistry } from "./writeCmuxSessionRegistry";

/**
 * Updates the registered title for the current Nexus cmux surface.
 *
 * @param sessionTitle Latest Nexus session title.
 */
export async function updateCurrentNexusSessionTitle(
	sessionTitle: string,
): Promise<void> {
	const target = getCurrentCmuxRenameTarget();
	const surfaceId = target.surfaceId;
	if (!surfaceId) return;
	const registryPath = getCmuxSessionRegistryPath();
	await withCmuxSessionRegistryLock(registryPath, async () => {
		const registry = await readCmuxSessionRegistry(registryPath);
		if (
			!registry.entries.some((entry) =>
				matchesCmuxSurfaceRegistration(entry, target.workspaceId, surfaceId),
			)
		)
			return;
		const updated = updateCmuxSessionRegistryEntryTitle(
			registry,
			target.workspaceId,
			surfaceId,
			sessionTitle,
		);
		await writeCmuxSessionRegistry(registryPath, updated);
	});
}
