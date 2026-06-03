import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { copyPath } from "./copyPath.mjs";

/**
 * Copies every Markdown file from one directory into another.
 *
 * @param {string} sourceDir Directory containing Markdown files.
 * @param {string} destinationDir Destination directory.
 * @returns {Promise<void>}
 */
export async function copyMarkdownFilesFromDir(sourceDir, destinationDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    await copyPath(join(sourceDir, entry.name), join(destinationDir, entry.name));
  }
}
