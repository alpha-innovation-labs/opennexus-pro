import { stat } from "node:fs/promises";

const STEER_QUEUE_LOCK_STALE_MS = 30_000;

/**
 * Checks whether a steering queue lock is old enough to remove.
 *
 * @param lockPath Lock directory path.
 * @returns True when the lock is stale or unreadable.
 */
export async function isSteerQueueFileLockStale(lockPath: string): Promise<boolean> {
  try {
    const stats = await stat(lockPath);
    return Date.now() - stats.mtimeMs > STEER_QUEUE_LOCK_STALE_MS;
  } catch {
    return true;
  }
}
