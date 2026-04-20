import { readdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Recursively lists TypeScript entry points under a directory.
 *
 * @param {string} directory Source directory to scan.
 * @returns {Promise<string[]>} Absolute or relative entry point paths.
 */
export async function listSourceEntryPoints(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return listSourceEntryPoints(entryPath);
      }
      if (entry.isFile() && entry.name.endsWith(".ts")) {
        return [entryPath];
      }
      return [];
    }),
  );

  return files.flat().sort();
}
