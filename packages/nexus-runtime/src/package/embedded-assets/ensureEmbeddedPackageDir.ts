import { getEmbeddedPackageAssets } from "./getEmbeddedPackageAssets.js";
import { getEmbeddedPackageDirPath } from "./getEmbeddedPackageDirPath.js";
import { readEmbeddedPackageVersion } from "./readEmbeddedPackageVersion.js";
import { writeEmbeddedPackageAssets } from "./writeEmbeddedPackageAssets.js";

/**
 * Ensures the binary-only package assets are extracted under the agent dir.
 *
 * @returns Absolute extracted package directory.
 */
export async function ensureEmbeddedPackageDir(): Promise<string> {
  const packageDir = getEmbeddedPackageDirPath();
  const { embeddedPackageAssetVersion } = getEmbeddedPackageAssets();
  const currentVersion = await readEmbeddedPackageVersion(packageDir);

  if (currentVersion !== embeddedPackageAssetVersion) {
    await writeEmbeddedPackageAssets(packageDir);
  }

  return packageDir;
}
