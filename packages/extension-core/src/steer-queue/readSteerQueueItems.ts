import { readFile } from "node:fs/promises";
import { parseSteerQueueItems } from "./parseSteerQueueItems.js";
import type { SteerQueueItem } from "./types.js";

/**
 * Reads persisted steering queue items from disk.
 *
 * @param filePath Queue file path.
 * @returns Parsed queue items, or an empty list when absent.
 */
export async function readSteerQueueItems(filePath: string): Promise<SteerQueueItem[]> {
  try {
    return parseSteerQueueItems(await readFile(filePath, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
