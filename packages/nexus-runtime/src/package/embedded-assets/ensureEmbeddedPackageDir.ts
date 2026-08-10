import { getEmbeddedPackageAssets } from "./getEmbeddedPackageAssets";
import { getEmbeddedPackageDirPath } from "./getEmbeddedPackageDirPath";
import { readEmbeddedPackageVersion } from "./readEmbeddedPackageVersion";
import { writeEmbeddedPackageAssets } from "./writeEmbeddedPackageAssets";

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
