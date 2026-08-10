import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { resetEmbeddedPackageDir } from "./fs/resetEmbeddedPackageDir";
import { writeEmbeddedAssetFile } from "./fs/writeEmbeddedAssetFile";
import { getEmbeddedPackageAssets } from "./getEmbeddedPackageAssets";

/**
 * Writes the full embedded package asset set to disk.
 *
 * @param rootDir Extraction root directory.
 * @returns A promise that resolves after extraction.
 */
export async function writeEmbeddedPackageAssets(rootDir: string): Promise<void> {
  await resetEmbeddedPackageDir(rootDir);

  const { embeddedPackageAssetVersion, embeddedPackageAssets } = getEmbeddedPackageAssets();
  for (const asset of embeddedPackageAssets) {
    await writeEmbeddedAssetFile(rootDir, asset);
  }

  await writeFile(join(rootDir, ".version"), `${embeddedPackageAssetVersion}\n`, "utf8");
}
