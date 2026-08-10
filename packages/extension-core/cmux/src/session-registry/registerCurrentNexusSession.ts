import { getCurrentCmuxRenameTarget } from "../runtime/getCurrentCmuxRenameTarget";
import { createNexusResumeCommand } from "./createNexusResumeCommand";
import { getCmuxSessionRegistryPath } from "./getCmuxSessionRegistryPath";
import { normalizeCmuxSessionTitle } from "./normalizeCmuxSessionTitle";
import { readCmuxSessionRegistry } from "./readCmuxSessionRegistry";
import { upsertCmuxSessionRegistryEntry } from "./upsertCmuxSessionRegistryEntry";
import { withCmuxSessionRegistryLock } from "./withCmuxSessionRegistryLock";
import { writeCmuxSessionRegistry } from "./writeCmuxSessionRegistry";

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
			cwd: process.cwd(),
			pid: process.pid,
			restoreCommand: createNexusResumeCommand(sessionId),
			updatedAt: new Date().toISOString(),
		});
		await writeCmuxSessionRegistry(registryPath, updated);
	});
}
