import { stat } from "node:fs/promises";
import { CMUX_SESSION_REGISTRY_LOCK_STALE_MS } from "./cmuxSessionRegistryLockConstants.js";

/**
 * Checks whether a lock directory is older than the stale-lock threshold.
 *
 * @param lockPath Lock directory path.
 * @returns True when the lock directory age exceeds the stale threshold.
 */
export async function isCmuxSessionRegistryLockDirOld(lockPath: string): Promise<boolean> {
	try {
		const lockStats = await stat(lockPath);
		return Date.now() - lockStats.mtimeMs > CMUX_SESSION_REGISTRY_LOCK_STALE_MS;
	} catch {
		return false;
	}
}
