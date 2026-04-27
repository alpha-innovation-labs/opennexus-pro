import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { copyPath } from "./copyPath.mjs";
import { isPiThemeAssetFile } from "./isPiThemeAssetFile.mjs";

const PI_THEME_ROOT = resolve("node_modules", "@mariozechner", "pi-coding-agent", "dist", "modes", "interactive", "theme");

/**
 * Copies built-in Pi theme JSON files into the bundle.
 *
 * @param {string} bundleDir Bundle output directory.
 * @returns {Promise<void>}
 */
export async function copyPiThemeAssets(bundleDir) {
  const entries = await readdir(PI_THEME_ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (!isPiThemeAssetFile(entry)) continue;
    await copyPath(join(PI_THEME_ROOT, entry.name), join(bundleDir, "theme", entry.name));
  }
}
