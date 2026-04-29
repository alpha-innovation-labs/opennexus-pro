import { readdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Recursively lists JSONL files under a directory.
 *
 * @param root Directory to scan.
 * @returns Absolute JSONL file paths.
 */
export async function listJsonlFiles(root: string): Promise<string[]> {
  const files: string[] = [];

  async function visit(directory: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    await Promise.all(entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith(".jsonl")) files.push(path);
    }));
  }

  await visit(root);
  return files;
}
