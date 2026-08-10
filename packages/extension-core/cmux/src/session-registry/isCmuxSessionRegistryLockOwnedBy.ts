import type { CmuxSessionRegistryLockMetadata } from "./CmuxSessionRegistryLockMetadata";
import { readCmuxSessionRegistryLockMetadata } from "./readCmuxSessionRegistryLockMetadata";

/**
 * Checks whether a lock directory still belongs to the expected owner metadata.
 *
 * @param lockPath Lock directory path.
 * @param owner Expected lock owner metadata.
 * @returns True when the lock metadata still matches the expected owner.
 */
export async function isCmuxSessionRegistryLockOwnedBy(lockPath: string, owner: CmuxSessionRegistryLockMetadata): Promise<boolean> {
	const current = await readCmuxSessionRegistryLockMetadata(lockPath);
	return current?.pid === owner.pid && current.nonce === owner.nonce;
}
