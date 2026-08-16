/**
 * Removes an abandoned cmux registry lock after a guarded stale recheck.
 *
 * @param lockPath Lock directory path.
 * @returns True when a stale lock was removed.
 */
export declare function removeStaleCmuxSessionRegistryLock(lockPath: string): Promise<boolean>;
