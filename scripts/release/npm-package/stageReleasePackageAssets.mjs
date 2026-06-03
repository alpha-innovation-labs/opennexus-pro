import { join, resolve } from "node:path";
import { copyJsonFilesFromDir } from "../binary/copyJsonFilesFromDir.mjs";
import { copyMarkdownFilesFromDir } from "../binary/copyMarkdownFilesFromDir.mjs";
import { copyPath } from "../binary/copyPath.mjs";
import { copyPiThemeAssets } from "../binary/copyPiThemeAssets.mjs";

/**
 * Copies non-code assets required by the published npm package.
 *
 * @param {string} packageDir npm package directory.
 * @returns {Promise<void>}
 */
export async function stageReleasePackageAssets(packageDir) {
  const distDir = join(packageDir, "dist");

  await copyPiThemeAssets(join(distDir, "modes", "interactive"));
  await copyJsonFilesFromDir(resolve("src", "themes"), join(distDir, "themes"));
  await copyMarkdownFilesFromDir(resolve("src", "commands"), join(distDir, "commands"));
  await copyPath(
    resolve("src", "runtime", "config", "default-settings", "settings.json"),
    join(distDir, "runtime", "config", "default-settings", "settings.json"),
  );
}
