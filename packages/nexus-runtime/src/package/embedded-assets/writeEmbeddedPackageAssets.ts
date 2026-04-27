import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { embeddedPackageAssetVersion, embeddedPackageAssets } from "./generated/embeddedPackageAssets.js";
import { resetEmbeddedPackageDir } from "./fs/resetEmbeddedPackageDir.js";
import { writeEmbeddedAssetFile } from "./fs/writeEmbeddedAssetFile.js";

/**
 * Writes the full embedded package asset set to disk.
 *
 * @param rootDir Extraction root directory.
 * @returns A promise that resolves after extraction.
 */
export async function writeEmbeddedPackageAssets(rootDir: string): Promise<void> {
  await resetEmbeddedPackageDir(rootDir);

  for (const asset of embeddedPackageAssets) {
    await writeEmbeddedAssetFile(rootDir, asset);
  }

  await writeFile(join(rootDir, ".version"), `${embeddedPackageAssetVersion}\n`, "utf8");
}
