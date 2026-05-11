import { mkdir, rmdir } from "node:fs/promises";
import { dirname } from "node:path";

const CMUX_SESSION_REGISTRY_LOCK_TIMEOUT_MS = 5000;

/**
 * Serializes registry read-modify-write operations with a lock directory.
 *
 * @param registryPath Registry file path.
 * @param run Work to run while holding the lock.
 * @returns Result from the locked work.
 */
export async function withCmuxSessionRegistryLock<T>(registryPath: string, run: () => Promise<T>): Promise<T> {
	const lockPath = `${registryPath}.lock`;
	const startedAt = Date.now();
	await mkdir(dirname(registryPath), { recursive: true });
	for (;;) {
		try {
			await mkdir(lockPath, { recursive: false });
			break;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
			if (Date.now() - startedAt > CMUX_SESSION_REGISTRY_LOCK_TIMEOUT_MS) {
				throw new Error(`Timed out waiting for cmux session registry lock: ${lockPath}`);
			}
			await new Promise((resolve) => setTimeout(resolve, 25));
		}
	}
	try {
		return await run();
	} finally {
		await rmdir(lockPath).catch(() => undefined);
	}
}
