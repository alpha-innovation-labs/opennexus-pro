import { writeFile } from "node:fs/promises";
import { readSteerQueueItems } from "./readSteerQueueItems.js";
import type { SteerQueueItem } from "./types.js";
import { withSteerQueueFileLock } from "./withSteerQueueFileLock.js";

/**
 * Drains queued steering items from one queue file.
 *
 * @param filePath Queue file path.
 * @returns Items removed from the queue.
 */
export async function drainSteerQueueItems(filePath: string): Promise<SteerQueueItem[]> {
  return withSteerQueueFileLock(filePath, async () => {
    const items = await readSteerQueueItems(filePath);
    if (items.length) await writeFile(filePath, "", "utf8");
    return items;
  });
}
