import { chmod, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { EmbeddedPackageAsset } from "../types";

/**
 * Writes one embedded package asset to disk.
 *
 * @param rootDir Extraction root directory.
 * @param asset Embedded asset payload.
 * @returns A promise that resolves after the asset is written.
 */
export async function writeEmbeddedAssetFile(rootDir: string, asset: EmbeddedPackageAsset): Promise<void> {
  const targetPath = join(rootDir, asset.path);
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, Buffer.from(asset.contentBase64, "base64"));

  if (asset.mode !== undefined) {
    await chmod(targetPath, asset.mode);
  }
}
