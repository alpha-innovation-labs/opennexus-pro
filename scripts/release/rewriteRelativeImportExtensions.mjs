import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Rewrites relative TypeScript import suffixes to JavaScript in a directory tree.
 *
 * @param {string} directory Output directory to rewrite.
 * @returns {Promise<void>}
 */
export async function rewriteRelativeImportExtensions(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await rewriteRelativeImportExtensions(entryPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".js")) {
      continue;
    }

    const content = await readFile(entryPath, "utf8");
    const rewritten = content.replace(/(from\s+["'][.][^"']*)\.ts(["'])/g, "$1.js$2").replace(/(import\s*\(\s*["'][.][^"']*)\.ts(["']\s*\))/g, "$1.js$2");
    if (rewritten !== content) {
      await writeFile(entryPath, rewritten);
    }
  }
}
