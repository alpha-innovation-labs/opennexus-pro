import { mkdir, rm } from "node:fs/promises";
import { dirname } from "node:path";
import type { CmuxSessionRegistryLockMetadata } from "./CmuxSessionRegistryLockMetadata";
import { CMUX_SESSION_REGISTRY_LOCK_TIMEOUT_MS } from "./cmuxSessionRegistryLockConstants";
import { createCmuxSessionRegistryLockMetadata } from "./createCmuxSessionRegistryLockMetadata";
import { getCmuxSessionRegistryLockPath } from "./getCmuxSessionRegistryLockPath";
import { isCmuxSessionRegistryLockOwnedBy } from "./isCmuxSessionRegistryLockOwnedBy";
import { removeStaleCmuxSessionRegistryLock } from "./removeStaleCmuxSessionRegistryLock";
import { waitForCmuxSessionRegistryLockRetry } from "./waitForCmuxSessionRegistryLockRetry";
import { writeCmuxSessionRegistryLockMetadata } from "./writeCmuxSessionRegistryLockMetadata";

/**
 * Serializes registry read-modify-write operations with a lock directory.
 *
 * @param registryPath Registry file path.
 * @param run Work to run while holding the lock.
 * @returns Result from the locked work.
 */
export async function withCmuxSessionRegistryLock<T>(registryPath: string, run: () => Promise<T>): Promise<T> {
	const lockPath = getCmuxSessionRegistryLockPath(registryPath);
	const startedAt = Date.now();
	let owner: CmuxSessionRegistryLockMetadata | undefined;
	await mkdir(dirname(registryPath), { recursive: true });
	for (;;) {
		try {
			await mkdir(lockPath, { recursive: false });
			owner = createCmuxSessionRegistryLockMetadata();
			await writeCmuxSessionRegistryLockMetadata(lockPath, owner);
			break;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
				if (owner) await rm(lockPath, { recursive: true, force: true }).catch(() => undefined);
				throw error;
			}
			await removeStaleCmuxSessionRegistryLock(lockPath);
			if (Date.now() - startedAt > CMUX_SESSION_REGISTRY_LOCK_TIMEOUT_MS) {
				throw new Error(`Timed out waiting for cmux session registry lock: ${lockPath}`);
			}
			await waitForCmuxSessionRegistryLockRetry();
		}
	}
	try {
		return await run();
	} finally {
		if (owner && await isCmuxSessionRegistryLockOwnedBy(lockPath, owner)) {
			await rm(lockPath, { recursive: true, force: true });
		}
	}
}
