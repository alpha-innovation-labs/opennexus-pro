import { join, resolve } from "node:path";
import { copyExportHtmlAssets } from "./copyExportHtmlAssets.mjs";
import { copyJsonFilesFromDir } from "./copyJsonFilesFromDir.mjs";
import { copyPath } from "./copyPath.mjs";
import { copyPiThemeAssets } from "./copyPiThemeAssets.mjs";

/**
 * Copies package assets needed by the native binary bundle.
 *
 * @param {string} bundleDir Bundle output directory.
 * @returns {Promise<void>}
 */
export async function stageBinaryAssets(bundleDir) {
  const packageDir = join(bundleDir, "package");
  const copies = [[resolve("package.json"), join(packageDir, "package.json")]];

  for (const [source, destination] of copies) {
    await copyPath(source, destination);
  }

  await copyPiThemeAssets(packageDir);
  await copyJsonFilesFromDir(resolve("packages", "assets", "src", "themes"), join(packageDir, "theme"));
  await copyPath(resolve("packages", "assets", "src", "commands", "nexus-git-commit.md"), join(packageDir, "commands", "nexus-git-commit.md"));
  await copyPath(
    resolve("packages", "assets", "src", "default-settings", "settings.json"),
    join(packageDir, "runtime", "config", "default-settings", "settings.json"),
  );
  await copyExportHtmlAssets(packageDir);
  await copyPath(resolve("node_modules", "@mariozechner", "pi-coding-agent", "dist", "modes", "interactive", "assets"), join(packageDir, "assets"));
}
