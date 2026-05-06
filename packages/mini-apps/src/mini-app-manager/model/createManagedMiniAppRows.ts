import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";
import type { ManagedExtensionRow } from "@nexus/extensions/extension-manager/model/types.js";

/**
 * Creates mini-app manager rows from feature flags marked as mini-apps.
 *
 * @param config Current feature flag config.
 * @returns Sorted mini-app rows for display.
 */
export function createManagedMiniAppRows(config: FeatureFlagsConfig): ManagedExtensionRow[] {
	const extensionRows = Object.entries(config.extensions)
		.filter(([, feature]) => feature.category === "mini-app")
		.map(([id, feature]) => ({
			id,
			kind: "core" as const,
			status: feature.enabled ? "enabled" as const : "disabled" as const,
			features: feature.features,
		}));
	const otherRows = Object.entries(config.other ?? {})
		.filter(([, feature]) => feature.category === "mini-app")
		.map(([id, feature]) => ({
			id,
			kind: "core" as const,
			status: feature.enabled ? "enabled" as const : "disabled" as const,
			features: feature.features,
		}));
	return [...extensionRows, ...otherRows].sort((a, b) => a.id.localeCompare(b.id));
}
