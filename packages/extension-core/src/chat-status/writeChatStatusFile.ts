import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { ChatStatusFile } from "./types.js";

/**
 * Writes the chat-status document atomically.
 *
 * @param filePath Chat-status file path.
 * @param file Chat-status content to write.
 */
export async function writeChatStatusFile(filePath: string, file: ChatStatusFile): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  await rename(tempPath, filePath);
}
