import { isRuntimeExtensionFeatureEnabled } from "@nexus/feature-flags/runtimeExtensionFeatureState";

/**
 * Counts enabled mini-app-category features from the hardcoded registry.
 *
 * Currently only "tetris" is a known mini-app.
 *
 * @returns Number of currently enabled mini-apps.
 */
export function countEnabledStartupHeroMiniApps(): number {
	const knownMiniApps = ["tetris"];
	let count = 0;
	for (const id of knownMiniApps) {
		if (isRuntimeExtensionFeatureEnabled(id)) {
			count++;
		}
	}
	return count;
}
