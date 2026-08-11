import { join } from "node:path";
import { CMUX_SESSION_REGISTRY_LOCK_METADATA_FILE } from "./cmuxSessionRegistryLockConstants";

/**
 * Resolves the owner metadata file path inside a cmux registry lock directory.
 *
 * @param lockPath Lock directory path.
 * @returns Lock metadata file path.
 */
export function getCmuxSessionRegistryLockMetadataPath(
	lockPath: string,
): string {
	return join(lockPath, CMUX_SESSION_REGISTRY_LOCK_METADATA_FILE);
}
