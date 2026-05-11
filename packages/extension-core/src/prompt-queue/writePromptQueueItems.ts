import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { PromptQueueItem } from "./types.js";

/**
 * Writes prompt queue items to disk as formatted JSON.
 *
 * @param filePath Prompt queue JSON file path.
 * @param items Queue items to persist.
 */
export async function writePromptQueueItems(filePath: string, items: PromptQueueItem[]): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}
