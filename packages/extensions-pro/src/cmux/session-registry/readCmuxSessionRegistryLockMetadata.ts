import { readFile } from "node:fs/promises";
import type { CmuxSessionRegistryLockMetadata } from "./CmuxSessionRegistryLockMetadata.js";
import { getCmuxSessionRegistryLockMetadataPath } from "./getCmuxSessionRegistryLockMetadataPath.js";
import { parseCmuxSessionRegistryLockMetadata } from "./parseCmuxSessionRegistryLockMetadata.js";

/**
 * Reads valid owner metadata from a cmux registry lock directory.
 *
 * @param lockPath Lock directory path.
 * @returns Valid lock owner metadata, when readable.
 */
export async function readCmuxSessionRegistryLockMetadata(lockPath: string): Promise<CmuxSessionRegistryLockMetadata | undefined> {
	try {
		return parseCmuxSessionRegistryLockMetadata(JSON.parse(await readFile(getCmuxSessionRegistryLockMetadataPath(lockPath), "utf8")));
	} catch {
		return undefined;
	}
}
