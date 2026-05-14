import { mkdir, rm, rmdir } from "node:fs/promises";
import { dirname } from "node:path";
import { getChatStatusFileLockPath } from "./getChatStatusFileLockPath.js";
import { isChatStatusFileLockStale } from "./isChatStatusFileLockStale.js";
import { waitForChatStatusFileLockRetry } from "./waitForChatStatusFileLockRetry.js";

const CHAT_STATUS_LOCK_ATTEMPTS = 100;

/**
 * Runs a chat-status file update while holding an inter-process lock.
 *
 * @param filePath Chat-status file path.
 * @param run Locked operation to execute.
 * @returns Locked operation result.
 */
export async function withChatStatusFileLock<T>(filePath: string, run: () => Promise<T>): Promise<T> {
  const lockPath = getChatStatusFileLockPath(filePath);
  await mkdir(dirname(filePath), { recursive: true });

  for (let attempt = 0; attempt < CHAT_STATUS_LOCK_ATTEMPTS; attempt++) {
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
      if (await isChatStatusFileLockStale(lockPath)) {
        await rm(lockPath, { force: true, recursive: true });
        continue;
      }
      await waitForChatStatusFileLockRetry();
    }
  }

  throw new Error(`Timed out acquiring chat-status lock: ${lockPath}`);
}
