import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { copyPath } from "./copyPath.mjs";

/**
 * Copies every JSON file from one directory into another.
 *
 * @param {string} sourceDir Directory containing JSON files.
 * @param {string} destinationDir Destination directory.
 * @returns {Promise<void>}
 */
export async function copyJsonFilesFromDir(sourceDir, destinationDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    await copyPath(join(sourceDir, entry.name), join(destinationDir, entry.name));
  }
}
