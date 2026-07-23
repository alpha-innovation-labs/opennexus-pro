import { getAllBundledExtensionIds } from "@nexus/feature-flags/registry.js";
import { isRuntimeExtensionFeatureEnabled } from "@nexus/feature-flags/runtimeExtensionFeatureState.js";

/**
 * Counts enabled extension-category features from the hardcoded registry.
 *
 * Mini-apps are excluded from this count.
 *
 * @returns Number of currently enabled extensions.
 */
export function countEnabledStartupHeroExtensions(): number {
	const allIds = getAllBundledExtensionIds();
	const knownMiniApps = new Set(["tetris"]);
	let count = 0;
	for (const id of allIds) {
		if (knownMiniApps.has(id)) continue;
		if (isRuntimeExtensionFeatureEnabled(id)) {
			count++;
		}
	}
	return count;
}
