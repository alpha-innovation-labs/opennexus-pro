import type { EmbeddedPackageAssetsModule } from "./types";

export const embeddedPackageAssetsGlobalKey = "__nexusEmbeddedPackageAssets";

export type EmbeddedPackageAssetsGlobal = typeof globalThis & {
	__nexusEmbeddedPackageAssets?: EmbeddedPackageAssetsModule;
};
