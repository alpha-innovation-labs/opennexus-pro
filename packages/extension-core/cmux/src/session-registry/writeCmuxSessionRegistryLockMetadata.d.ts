import type { CmuxSessionRegistryLockMetadata } from "./CmuxSessionRegistryLockMetadata";
/**
 * Writes cmux registry lock owner metadata with private permissions.
 *
 * @param lockPath Lock directory path.
 * @param metadata Lock owner metadata.
 */
export declare function writeCmuxSessionRegistryLockMetadata(lockPath: string, metadata: CmuxSessionRegistryLockMetadata): Promise<void>;
