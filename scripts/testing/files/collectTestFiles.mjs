import { readdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Recursively collects files under one directory in deterministic order.
 *
 * @param {string} directoryPath Directory to scan.
 * @returns {Promise<string[]>} Absolute file paths.
 */
export async function collectTestFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const sortedEntries = [...entries].sort((left, right) => left.name.localeCompare(right.name));
  const files = [];

  for (const entry of sortedEntries) {
    const entryPath = join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectTestFiles(entryPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}
