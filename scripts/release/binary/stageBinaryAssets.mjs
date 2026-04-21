import { join, resolve } from "node:path";
import { copyExportHtmlAssets } from "./copyExportHtmlAssets.mjs";
import { copyJsonFilesFromDir } from "./copyJsonFilesFromDir.mjs";
import { copyNodePtyRuntimeAssets } from "./copyNodePtyRuntimeAssets.mjs";
import { copyPath } from "./copyPath.mjs";
import { copyPiThemeAssets } from "./copyPiThemeAssets.mjs";
import { copyXtermHeadlessRuntimeAssets } from "./copyXtermHeadlessRuntimeAssets.mjs";

/**
 * Copies package assets needed by the native binary bundle.
 *
 * @param {string} bundleDir Bundle output directory.
 * @returns {Promise<void>}
 */
export async function stageBinaryAssets(bundleDir) {
  const copies = [[resolve("package.json"), join(bundleDir, "package.json")]];

  for (const [source, destination] of copies) {
    await copyPath(source, destination);
  }

  await copyPiThemeAssets(bundleDir);
  await copyJsonFilesFromDir(resolve("src", "themes"), join(bundleDir, "theme"));
  await copyPath(resolve("src", "commands"), join(bundleDir, "commands"));
  await copyPath(resolve("src", "runtime", "config", "default-settings"), join(bundleDir, "src", "runtime", "config", "default-settings"));
  await copyExportHtmlAssets(bundleDir);
  await copyNodePtyRuntimeAssets(bundleDir);
  await copyXtermHeadlessRuntimeAssets(bundleDir);
}
