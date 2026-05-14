import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { getBuildWorkDir } from "./getBuildWorkDir.mjs";
import { getEmbeddedPackageAssetsModulePath } from "./getEmbeddedPackageAssetsModulePath.mjs";
import { listEmbeddedPackageAssetEntries } from "./listEmbeddedPackageAssetEntries.mjs";

/**
 * Writes the generated embedded package asset module into the ignored release workspace.
 *
 * @param {string} outputPath Absolute generated module path.
 * @returns {Promise<void>}
 */
export async function writeEmbeddedPackageAssetsModule(outputPath = getEmbeddedPackageAssetsModulePath(getBuildWorkDir())) {
  const assets = await listEmbeddedPackageAssetEntries();
  const version = createHash("sha256").update(JSON.stringify(assets)).digest("hex").slice(0, 16);
  const content = [
    'import type { EmbeddedPackageAsset } from "../../packages/nexus-runtime/src/package/embedded-assets/types.js";',
    '',
    `export const embeddedPackageAssetVersion = ${JSON.stringify(version)};`,
    '',
    'export const embeddedPackageAssets: EmbeddedPackageAsset[] = ',
    `${JSON.stringify(assets, null, 2)} as EmbeddedPackageAsset[];`,
    '',
  ].join("\n");

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, "utf8");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await writeEmbeddedPackageAssetsModule();
}
