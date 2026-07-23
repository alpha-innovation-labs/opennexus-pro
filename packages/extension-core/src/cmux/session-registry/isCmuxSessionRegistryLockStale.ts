import { isProcessRunning } from "./isProcessRunning.js";
import { isCmuxSessionRegistryLockDirOld } from "./isCmuxSessionRegistryLockDirOld.js";
import { readCmuxSessionRegistryLockMetadata } from "./readCmuxSessionRegistryLockMetadata.js";

/**
 * Detects whether a cmux registry lock can be treated as abandoned.
 *
 * @param lockPath Lock directory path.
 * @returns True when the lock owner exited or legacy lock age is stale.
 */
export async function isCmuxSessionRegistryLockStale(lockPath: string): Promise<boolean> {
	const metadata = await readCmuxSessionRegistryLockMetadata(lockPath);
	if (metadata) return !isProcessRunning(metadata.pid);
	return isCmuxSessionRegistryLockDirOld(lockPath);
}
