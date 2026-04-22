import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { ensureCleanDir } from "../binary/ensureCleanDir.mjs";
import { listSourceEntryPoints } from "../listSourceEntryPoints.mjs";
import { rewriteRelativeImportExtensions } from "../rewriteRelativeImportExtensions.mjs";

const SOURCE_DIR = resolve("node_modules", "pi-slash-usage", "src");
const PACKAGE_JSON_PATH = resolve("node_modules", "pi-slash-usage", "package.json");

/**
 * Builds and stages a JavaScript version of the `pi-slash-usage` package.
 *
 * @param {string} packageDir npm package directory.
 * @returns {Promise<void>}
 */
export async function stageBundledPiSlashUsagePackage(packageDir) {
  const outputDir = join(packageDir, "node_modules", "pi-slash-usage");
  const distDir = join(outputDir, "dist");
  const packageJson = JSON.parse(await readFile(PACKAGE_JSON_PATH, "utf8"));
  const entryPoints = await listSourceEntryPoints(SOURCE_DIR);

  await ensureCleanDir(outputDir);
  await mkdir(dirname(distDir), { recursive: true });

  await build({
    entryPoints,
    outdir: distDir,
    outbase: SOURCE_DIR,
    platform: "node",
    format: "esm",
    target: "node20",
    bundle: false,
    sourcemap: false,
    packages: "external",
  });

  await rewriteRelativeImportExtensions(distDir);

  await writeFile(
    join(outputDir, "package.json"),
    `${JSON.stringify({
      name: packageJson.name,
      version: packageJson.version,
      type: "module",
      main: "./dist/index.js",
      exports: {
        ".": "./dist/index.js",
      },
      dependencies: Object.fromEntries(
        Object.entries(packageJson.dependencies ?? {}).map(([name, version]) => [name, String(version)]),
      ),
    }, null, 2)}\n`,
    "utf8",
  );
}
