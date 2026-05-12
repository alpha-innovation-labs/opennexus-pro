import { unlink } from "node:fs/promises";

/**
 * Deletes one persisted session JSONL file.
 *
 * @param sessionPath Absolute or relative path to the session JSONL file.
 */
export async function deleteSessionFile(sessionPath: string): Promise<void> {
  await unlink(sessionPath);
}
