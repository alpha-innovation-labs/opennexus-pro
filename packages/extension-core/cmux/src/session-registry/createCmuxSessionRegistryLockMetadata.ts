import { randomUUID } from "node:crypto";
import type { CmuxSessionRegistryLockMetadata } from "./CmuxSessionRegistryLockMetadata";

/**
 * Creates owner metadata for the current cmux registry lock holder.
 *
 * @returns Lock owner metadata.
 */
export function createCmuxSessionRegistryLockMetadata(): CmuxSessionRegistryLockMetadata {
	return {
		version: 1,
		pid: process.pid,
		createdAt: new Date().toISOString(),
		nonce: randomUUID(),
	};
}
