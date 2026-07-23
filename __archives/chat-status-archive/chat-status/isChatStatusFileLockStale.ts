import { stat } from "node:fs/promises";

const CHAT_STATUS_LOCK_STALE_MS = 30_000;

/**
 * Checks whether a chat-status lock directory is old enough to remove.
 *
 * @param lockPath Lock directory path.
 * @returns True when the lock is stale or unreadable.
 */
export async function isChatStatusFileLockStale(lockPath: string): Promise<boolean> {
  try {
    const stats = await stat(lockPath);
    return Date.now() - stats.mtimeMs > CHAT_STATUS_LOCK_STALE_MS;
  } catch {
    return true;
  }
}
