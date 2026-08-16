import type { CmuxSessionRegistryLockMetadata } from "./CmuxSessionRegistryLockMetadata";
/**
 * Reads valid owner metadata from a cmux registry lock directory.
 *
 * @param lockPath Lock directory path.
 * @returns Valid lock owner metadata, when readable.
 */
export declare function readCmuxSessionRegistryLockMetadata(lockPath: string): Promise<CmuxSessionRegistryLockMetadata | undefined>;
