import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const EMBEDDED_ASSET_ROOTS = [
  [resolve("package.json"), "package.json"],
  [resolve("src", "themes"), "theme"],
  [resolve("src", "commands", "nexus-git-commit.md"), "commands/nexus-git-commit.md"],
  [resolve("src", "runtime", "config", "default-settings", "settings.json"), "runtime/config/default-settings/settings.json"],
  [resolve("node_modules", "@mariozechner", "pi-coding-agent", "dist", "core", "export-html"), "export-html"],
  [resolve("node_modules", "@mariozechner", "pi-coding-agent", "dist", "modes", "interactive", "assets"), "assets"],
  [resolve("node_modules", "node-pty", "lib"), "runtime/node_modules/node-pty/lib"],
  [resolve("node_modules", "node-pty", "prebuilds", "darwin-arm64"), "runtime/node_modules/node-pty/prebuilds/darwin-arm64"],
  [resolve("node_modules", "node-pty", "LICENSE"), "runtime/node_modules/node-pty/LICENSE"],
  [resolve("node_modules", "@xterm", "headless", "lib-headless"), "runtime/node_modules/@xterm/headless/lib-headless"],
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

  return assets.sort((left, right) => left.path.localeCompare(right.path));
}
