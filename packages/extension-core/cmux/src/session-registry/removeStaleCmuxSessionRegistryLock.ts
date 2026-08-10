import { mkdir, rm, rmdir } from "node:fs/promises";
import { isCmuxSessionRegistryLockDirOld } from "./isCmuxSessionRegistryLockDirOld";
import { isCmuxSessionRegistryLockStale } from "./isCmuxSessionRegistryLockStale";
import { readCmuxSessionRegistryLockMetadata } from "./readCmuxSessionRegistryLockMetadata";

/**
 * Removes an abandoned cmux registry lock after a guarded stale recheck.
 *
 * @param lockPath Lock directory path.
 * @returns True when a stale lock was removed.
 */
export async function removeStaleCmuxSessionRegistryLock(lockPath: string): Promise<boolean> {
	const breakerPath = `${lockPath}.breaker`;
	try {
		await mkdir(breakerPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "EEXIST") return false;
		throw error;
	}

	try {
		if (!(await isCmuxSessionRegistryLockStale(lockPath))) return false;
		const metadata = await readCmuxSessionRegistryLockMetadata(lockPath);
		if (metadata) {
			await rm(lockPath, { recursive: true, force: true });
			return true;
		}
		if (!(await isCmuxSessionRegistryLockDirOld(lockPath))) return false;
		await rmdir(lockPath);
		return true;
	} catch (error) {
		if (["ENOENT", "ENOTEMPTY", "EEXIST"].includes((error as NodeJS.ErrnoException).code ?? "")) return false;
		throw error;
	} finally {
		await rmdir(breakerPath).catch(() => undefined);
	}
}
