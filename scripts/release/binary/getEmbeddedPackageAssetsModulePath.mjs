import { join } from "node:path";

/**
 * Resolves the ignored release-build embedded package asset module path.
 *
 * @param {string} buildWorkDir Release workspace directory.
 * @returns {string} Absolute generated asset module path.
 */
export function getEmbeddedPackageAssetsModulePath(buildWorkDir) {
  return join(buildWorkDir, "embeddedPackageAssets.ts");
}
