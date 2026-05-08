import { readFile } from "node:fs/promises";
import { parsePromptQueueItems } from "./parsePromptQueueItems.js";
import type { PromptQueueItem } from "./types.js";

/**
 * Reads persisted prompt queue items from disk.
 *
 * @param filePath Prompt queue JSON file path.
 * @returns Persisted queue items, or an empty queue when absent/invalid.
 */
export async function readPromptQueueItems(filePath: string): Promise<PromptQueueItem[]> {
  try {
    return parsePromptQueueItems(JSON.parse(await readFile(filePath, "utf8")));
  } catch {
    return [];
  }
}
