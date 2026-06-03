import { mkdir, rm, rmdir } from "node:fs/promises";
import { dirname } from "node:path";
import { getSteerQueueLockPath } from "./getSteerQueueLockPath.js";
import { isSteerQueueFileLockStale } from "./isSteerQueueFileLockStale.js";
import { waitForSteerQueueFileLockRetry } from "./waitForSteerQueueFileLockRetry.js";

const STEER_QUEUE_LOCK_ATTEMPTS = 100;

/**
 * Runs a steering queue update while holding an inter-process lock.
 *
 * @param filePath Queue file path.
 * @param run Locked operation to execute.
 * @returns Locked operation result.
 */
export async function withSteerQueueFileLock<T>(filePath: string, run: () => Promise<T>): Promise<T> {
  const lockPath = getSteerQueueLockPath(filePath);
  await mkdir(dirname(filePath), { recursive: true });

  for (let attempt = 0; attempt < STEER_QUEUE_LOCK_ATTEMPTS; attempt += 1) {
    try {
      await mkdir(lockPath);
      try {
        return await run();
      } finally {
        await rmdir(lockPath).catch(() => undefined);
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw error;
      if (await isSteerQueueFileLockStale(lockPath)) {
        await rm(lockPath, { force: true, recursive: true });
        continue;
      }
      await waitForSteerQueueFileLockRetry();
    }
  }

  throw new Error(`Timed out acquiring steering queue lock: ${lockPath}`);
}
