import { readFile } from "node:fs/promises";

/**
 * Reads raw JSONL entries from a persisted session file.
 *
 * @param sessionPath Session JSONL path.
 * @returns Parsed entries in file order.
 */
export async function readSessionEntries(sessionPath: string): Promise<unknown[]> {
  const content = await readFile(sessionPath, "utf8");
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as unknown);
}
