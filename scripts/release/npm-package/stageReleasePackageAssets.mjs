import { join, resolve } from "node:path";
import { copyJsonFilesFromDir } from "../binary/copyJsonFilesFromDir.mjs";
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
  await copyPath(resolve("src", "commands", "nexus-git-commit.md"), join(distDir, "commands", "nexus-git-commit.md"));
  await copyPath(
    resolve("src", "runtime", "config", "default-settings", "settings.json"),
    join(distDir, "runtime", "config", "default-settings", "settings.json"),
  );
}
