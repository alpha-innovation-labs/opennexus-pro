import { writeFile } from "node:fs/promises";
import type { CmuxSessionRegistryLockMetadata } from "./CmuxSessionRegistryLockMetadata";
import { getCmuxSessionRegistryLockMetadataPath } from "./getCmuxSessionRegistryLockMetadataPath";

/**
 * Writes cmux registry lock owner metadata with private permissions.
 *
 * @param lockPath Lock directory path.
 * @param metadata Lock owner metadata.
 */
export async function writeCmuxSessionRegistryLockMetadata(lockPath: string, metadata: CmuxSessionRegistryLockMetadata): Promise<void> {
	await writeFile(getCmuxSessionRegistryLockMetadataPath(lockPath), `${JSON.stringify(metadata)}\n`, { encoding: "utf8", mode: 0o600 });
}
