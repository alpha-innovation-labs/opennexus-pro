import {
	type EmbeddedPackageAssetsGlobal,
	embeddedPackageAssetsGlobalKey,
} from "./embeddedPackageAssetsGlobal";
import type { EmbeddedPackageAssetsModule } from "./types";

/**
 * Reads release-embedded package assets registered by the compiled binary entrypoint.
 *
 * @returns Embedded package asset data for the current release binary.
 */
export function getEmbeddedPackageAssets(): EmbeddedPackageAssetsModule {
	const assets = (globalThis as EmbeddedPackageAssetsGlobal)[
		embeddedPackageAssetsGlobalKey
	];
	if (!assets) {
		throw new Error(
			"Embedded package assets are only available after the Nexus release entrypoint registers them.",
		);
	}

	return assets;
}
