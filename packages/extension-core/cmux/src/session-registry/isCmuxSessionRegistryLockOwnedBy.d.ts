import type { CmuxSessionRegistryLockMetadata } from "./CmuxSessionRegistryLockMetadata";
/**
 * Checks whether a lock directory still belongs to the expected owner metadata.
 *
 * @param lockPath Lock directory path.
 * @param owner Expected lock owner metadata.
 * @returns True when the lock metadata still matches the expected owner.
 */
export declare function isCmuxSessionRegistryLockOwnedBy(lockPath: string, owner: CmuxSessionRegistryLockMetadata): Promise<boolean>;
