import { getCurrentCmuxRenameTarget } from "../runtime/getCurrentCmuxRenameTarget.js";
import { getCmuxSessionRegistryPath } from "./getCmuxSessionRegistryPath.js";
import { normalizeCmuxSessionTitle } from "./normalizeCmuxSessionTitle.js";
import { readCmuxSessionRegistry } from "./readCmuxSessionRegistry.js";
import { upsertCmuxSessionRegistryEntry } from "./upsertCmuxSessionRegistryEntry.js";
import { withCmuxSessionRegistryLock } from "./withCmuxSessionRegistryLock.js";
import { writeCmuxSessionRegistry } from "./writeCmuxSessionRegistry.js";

/**
 * Registers the current Nexus session for the active cmux surface.
 *
 * @param sessionId Nexus session id.
 * @param sessionFile Nexus session file path.
 * @param sessionTitle Nexus session title.
 */
export async function registerCurrentNexusSession(sessionId: string, sessionFile?: string, sessionTitle?: string): Promise<void> {
	const target = getCurrentCmuxRenameTarget();
	const surfaceId = target.surfaceId;
	if (!surfaceId) return;
	const registryPath = getCmuxSessionRegistryPath();
	await withCmuxSessionRegistryLock(registryPath, async () => {
		const registry = await readCmuxSessionRegistry(registryPath);
		const updated = upsertCmuxSessionRegistryEntry(registry, {
			workspaceId: target.workspaceId,
			surfaceId,
			sessionId,
			sessionTitle: normalizeCmuxSessionTitle(sessionTitle),
			sessionFile,
			pid: process.pid,
			updatedAt: new Date().toISOString(),
		});
		await writeCmuxSessionRegistry(registryPath, updated);
	});
}
