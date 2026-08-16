/**
 * Detects whether a cmux registry lock can be treated as abandoned.
 *
 * @param lockPath Lock directory path.
 * @returns True when the lock owner exited or legacy lock age is stale.
 */
export declare function isCmuxSessionRegistryLockStale(lockPath: string): Promise<boolean>;
