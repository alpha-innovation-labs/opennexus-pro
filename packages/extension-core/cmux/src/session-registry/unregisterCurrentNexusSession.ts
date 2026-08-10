import { getCurrentCmuxRenameTarget } from "../runtime/getCurrentCmuxRenameTarget";
import { getCmuxSessionRegistryPath } from "./getCmuxSessionRegistryPath";
import { readCmuxSessionRegistry } from "./readCmuxSessionRegistry";
import { removeCmuxSessionRegistryEntry } from "./removeCmuxSessionRegistryEntry";
import { withCmuxSessionRegistryLock } from "./withCmuxSessionRegistryLock";
import { writeCmuxSessionRegistry } from "./writeCmuxSessionRegistry";

/**
 * Removes the current Nexus session registration for the active cmux surface.
 */
export async function unregisterCurrentNexusSession(): Promise<void> {
	const target = getCurrentCmuxRenameTarget();
	const surfaceId = target.surfaceId;
	if (!surfaceId) return;
	const registryPath = getCmuxSessionRegistryPath();
	await withCmuxSessionRegistryLock(registryPath, async () => {
		const registry = await readCmuxSessionRegistry(registryPath);
		const updated = removeCmuxSessionRegistryEntry(registry, target.workspaceId, surfaceId);
		await writeCmuxSessionRegistry(registryPath, updated);
	});
}
