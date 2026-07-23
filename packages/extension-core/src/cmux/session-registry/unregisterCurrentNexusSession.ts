import { getCurrentCmuxRenameTarget } from "../runtime/getCurrentCmuxRenameTarget.js";
import { getCmuxSessionRegistryPath } from "./getCmuxSessionRegistryPath.js";
import { readCmuxSessionRegistry } from "./readCmuxSessionRegistry.js";
import { removeCmuxSessionRegistryEntry } from "./removeCmuxSessionRegistryEntry.js";
import { withCmuxSessionRegistryLock } from "./withCmuxSessionRegistryLock.js";
import { writeCmuxSessionRegistry } from "./writeCmuxSessionRegistry.js";

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
