import { join, resolve } from "node:path";
import { copyJsonFilesFromDir } from "./copyJsonFilesFromDir.mjs";

const PI_THEME_ROOT = resolve("node_modules", "@mariozechner", "pi-coding-agent", "dist", "modes", "interactive", "theme");

/**
 * Copies built-in Pi theme JSON files into the bundle.
 *
 * @param {string} bundleDir Bundle output directory.
 * @returns {Promise<void>}
 */
export async function copyPiThemeAssets(bundleDir) {
  await copyJsonFilesFromDir(PI_THEME_ROOT, join(bundleDir, "theme"));
}
