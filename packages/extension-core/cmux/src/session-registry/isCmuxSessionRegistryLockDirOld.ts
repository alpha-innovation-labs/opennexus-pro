import { stat } from "node:fs/promises";
import { CMUX_SESSION_REGISTRY_LEGACY_LOCK_STALE_MS } from "./cmuxSessionRegistryLockConstants";

/**
 * Checks whether a metadata-less legacy lock is old enough to be abandoned.
 *
 * @param lockPath Lock directory path.
 * @returns True when the lock directory age exceeds the legacy stale threshold.
 */
export async function isCmuxSessionRegistryLockDirOld(lockPath: string): Promise<boolean> {
	try {
		const lockStats = await stat(lockPath);
		return Date.now() - lockStats.mtimeMs > CMUX_SESSION_REGISTRY_LEGACY_LOCK_STALE_MS;
	} catch {
		return false;
	}
}
