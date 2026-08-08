import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";
import { listMarkdownFilesFromDir } from "./listMarkdownFilesFromDir.mjs";

const COMMANDS_SOURCE_DIR = resolve("packages", "assets", "src", "commands");

const EMBEDDED_ASSET_ROOTS = [
  [resolve("package.json"), "package.json"],
  [resolve("packages", "assets", "src", "themes"), "theme"],
  [resolve("packages", "assets", "src", "default-settings", "settings.json"), "runtime/config/default-settings/settings.json"],
  [resolve("packages", "assets", "src", "prompts", "base-system-prompt", "system_prompt.md"), "prompts/base-system-prompt/system_prompt.md"],
  [resolve("node_modules", "@earendil-works", "pi-coding-agent", "dist", "core", "export-html"), "export-html"],
  [resolve("node_modules", "@earendil-works", "pi-coding-agent", "dist", "modes", "interactive", "theme"), "theme"],
  [resolve("node_modules", "@earendil-works", "pi-coding-agent", "dist", "modes", "interactive", "assets"), "assets"],
];

/**
 * Walks a file tree and returns absolute file paths.
 *
 * @param rootPath Root path to walk.
 * @returns Absolute file paths.
 */
async function walkFiles(rootPath) {
  const rootStat = await stat(rootPath);
  if (!rootStat.isDirectory()) {
    return [rootPath];
  }

  const entries = await readdir(rootPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(rootPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)));
      continue;
    }
    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

/**
 * Lists the embedded package assets to compile into the binary.
 *
 * @returns Embedded asset records.
 */
export async function listEmbeddedPackageAssetEntries() {
  const assets = [];

  for (const [sourceRoot, destinationRoot] of EMBEDDED_ASSET_ROOTS) {
    for (const sourcePath of await walkFiles(sourceRoot)) {
      const assetStat = await stat(sourcePath);
      const destinationPath = assetStat.isDirectory()
        ? destinationRoot
        : join(destinationRoot, relative(sourceRoot, sourcePath));
      assets.push({
        path: destinationPath,
        contentBase64: (await readFile(sourcePath)).toString("base64"),
        mode: assetStat.mode & 0o777,
      });
    }
  }

  for (const sourcePath of await listMarkdownFilesFromDir(COMMANDS_SOURCE_DIR)) {
    const assetStat = await stat(sourcePath);
    assets.push({
      path: join("commands", basename(sourcePath)),
      contentBase64: (await readFile(sourcePath)).toString("base64"),
      mode: assetStat.mode & 0o777,
    });
  }

  return assets.sort((left, right) => left.path.localeCompare(right.path));
}
