import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { cleanBuildDir } from "./cleanBuildDir.mjs";
import { listSourceEntryPoints } from "./listSourceEntryPoints.mjs";
import { rewriteRelativeImportExtensions } from "./rewriteRelativeImportExtensions.mjs";

const sourceDir = resolve("src");
const outDir = resolve("dist");

/**
 * Builds the app source tree into executable JavaScript files under dist/.
 *
 * @returns {Promise<void>}
 */
export async function buildRelease() {
  const entryPoints = await listSourceEntryPoints(sourceDir);

  await cleanBuildDir(outDir);
  await mkdir(dirname(outDir), { recursive: true });

  await build({
    entryPoints,
    outdir: outDir,
    outbase: sourceDir,
    platform: "node",
    format: "esm",
    target: "node20",
    bundle: false,
    sourcemap: false,
    packages: "external",
  });

  await rewriteRelativeImportExtensions(outDir);
}

await buildRelease();
