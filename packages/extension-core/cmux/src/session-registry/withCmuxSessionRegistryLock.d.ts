/**
 * Serializes registry read-modify-write operations with a lock directory.
 *
 * @param registryPath Registry file path.
 * @param run Work to run while holding the lock.
 * @returns Result from the locked work.
 */
export declare function withCmuxSessionRegistryLock<T>(registryPath: string, run: () => Promise<T>): Promise<T>;
