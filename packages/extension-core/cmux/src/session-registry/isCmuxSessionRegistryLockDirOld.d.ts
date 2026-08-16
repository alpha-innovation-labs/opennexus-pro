/**
 * Checks whether a metadata-less legacy lock is old enough to be abandoned.
 *
 * @param lockPath Lock directory path.
 * @returns True when the lock directory age exceeds the legacy stale threshold.
 */
export declare function isCmuxSessionRegistryLockDirOld(lockPath: string): Promise<boolean>;
