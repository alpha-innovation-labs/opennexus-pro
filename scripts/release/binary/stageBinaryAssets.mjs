import { join, resolve } from "node:path";
import { copyExportHtmlAssets } from "./copyExportHtmlAssets.mjs";
import { copyJsonFilesFromDir } from "./copyJsonFilesFromDir.mjs";
import { copyMarkdownFilesFromDir } from "./copyMarkdownFilesFromDir.mjs";
import { copyPath } from "./copyPath.mjs";
import { copyPiThemeAssets } from "./copyPiThemeAssets.mjs";

/**
 * Copies package assets needed by the native binary bundle.
 *
 * Feature flags are now hardcoded in the TypeScript registry —
 * no JSON manifest or Tetris music gating is needed at release time.
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
  await copyMarkdownFilesFromDir(resolve("packages", "assets", "src", "commands"), join(packageDir, "commands"));
  await copyPath(
    resolve("packages", "assets", "src", "default-settings", "settings.json"),
    join(packageDir, "runtime", "config", "default-settings", "settings.json"),
  );
  await copyExportHtmlAssets(packageDir);
  await copyPath(resolve("node_modules", "@earendil-works", "pi-coding-agent", "dist", "modes", "interactive", "assets"), join(packageDir, "assets"));
}
