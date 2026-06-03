import { readdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Lists Markdown files directly inside one directory.
 *
 * @param {string} sourceDir Directory containing Markdown files.
 * @returns {Promise<string[]>} Absolute Markdown file paths sorted by filename.
 */
export async function listMarkdownFilesFromDir(sourceDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(sourceDir, entry.name))
    .sort((left, right) => left.localeCompare(right));
}
