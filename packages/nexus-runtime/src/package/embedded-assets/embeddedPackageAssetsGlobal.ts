import type { EmbeddedPackageAssetsModule } from "./types.js";

export const embeddedPackageAssetsGlobalKey = "__nexusEmbeddedPackageAssets";

export type EmbeddedPackageAssetsGlobal = typeof globalThis & {
  __nexusEmbeddedPackageAssets?: EmbeddedPackageAssetsModule;
};
