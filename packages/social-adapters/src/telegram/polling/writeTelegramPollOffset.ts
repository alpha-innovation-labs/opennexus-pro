import { writeFile } from "node:fs/promises";
import { getTelegramOffsetPath } from "./getTelegramOffsetPath.js";

/**
 * Persists the Telegram polling offset.
 *
 * @param offset Next update offset.
 * @returns A promise that resolves after the offset is saved.
 */
export async function writeTelegramPollOffset(offset: number): Promise<void> {
  await writeFile(getTelegramOffsetPath(), `${String(offset)}\n`, "utf8");
}
