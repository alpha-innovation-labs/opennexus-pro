import { readFile } from "node:fs/promises";
import { getTelegramOffsetPath } from "./getTelegramOffsetPath.js";

/**
 * Reads the stored Telegram polling offset.
 *
 * @returns Stored offset, defaulting to zero.
 */
export async function readTelegramPollOffset(): Promise<number> {
  try {
    return Number((await readFile(getTelegramOffsetPath(), "utf8")).trim()) || 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return 0;
    }
    throw error;
  }
}
