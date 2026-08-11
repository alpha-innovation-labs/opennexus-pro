import type { Result } from "@ff-labs/fff-node";

/**
 * Reports whether FFF initialization should retry without LMDB-backed databases.
 *
 * @param created Result returned by `FileFinder.create`.
 * @returns True when the LMDB reader limit was reached.
 */
export function shouldRetryWithoutDatabases(created: Result<unknown>): boolean {
	return !created.ok && created.error.includes("MDB_READERS_FULL");
}
