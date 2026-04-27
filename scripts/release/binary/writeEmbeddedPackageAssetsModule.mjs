import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { listEmbeddedPackageAssetEntries } from "./listEmbeddedPackageAssetEntries.mjs";

const OUTPUT_PATH = resolve("packages", "nexus-runtime", "src", "package", "embedded-assets", "generated", "embeddedPackageAssets.ts");

/**
 * Writes the generated embedded package asset module.
 *
 * @returns {Promise<void>}
 */
export async function writeEmbeddedPackageAssetsModule() {
  const assets = await listEmbeddedPackageAssetEntries();
  const version = createHash("sha256").update(JSON.stringify(assets)).digest("hex").slice(0, 16);
  const content = [
    'import type { EmbeddedPackageAsset } from "../types.js";',
    '',
    `export const embeddedPackageAssetVersion = ${JSON.stringify(version)};`,
    '',
    'export const embeddedPackageAssets: EmbeddedPackageAsset[] = ',
    `${JSON.stringify(assets, null, 2)} as EmbeddedPackageAsset[];`,
    '',
  ].join("\n");

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, content, "utf8");
}

await writeEmbeddedPackageAssetsModule();
