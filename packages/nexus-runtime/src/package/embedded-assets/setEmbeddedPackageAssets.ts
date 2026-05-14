import { embeddedPackageAssetsGlobalKey, type EmbeddedPackageAssetsGlobal } from "./embeddedPackageAssetsGlobal.js";
import type { EmbeddedPackageAssetsModule } from "./types.js";

/**
 * Registers release-embedded package assets for binary runtime extraction.
 *
 * @param assets Embedded package asset data generated during release build.
 */
export function setEmbeddedPackageAssets(assets: EmbeddedPackageAssetsModule): void {
  (globalThis as EmbeddedPackageAssetsGlobal)[embeddedPackageAssetsGlobalKey] = assets;
}
