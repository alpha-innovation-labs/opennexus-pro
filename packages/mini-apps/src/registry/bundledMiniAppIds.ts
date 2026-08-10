import type { FeatureProductCategory } from "./featureFlagsTypes";

/**
 * Canonical registry of all bundled mini-apps.
 *
 * This is the mini-apps-side mirror of @nexus/feature-flags/registry.js.
 * It provides getAllBundledExtensionIds so mini-apps can identify which
 * registered extensions are mini-apps without depending on feature-flags.
 */
export const bundledMiniAppIds = ["tetris"] as const;

/**
 * Returns all mini-app IDs registered in the hardcoded registry.
 *
 * @returns Array of all mini-app IDs.
 */
export function getAllBundledMiniAppIds(): string[] {
	return [...bundledMiniAppIds];
}
