import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";
import type { NexusUserConfig } from "@nexus/runtime/config/types.js";
import type { ManagedExtensionRow } from "./types.js";

/**
 * Creates extension manager rows for core bundled and user-installed extensions.
 *
 * @param config Bundled feature flag config.
 * @param userConfig User config with extension preferences.
 * @returns Sorted extension rows for display.
 */
export function createManagedExtensionRows(config: FeatureFlagsConfig, userConfig: NexusUserConfig): ManagedExtensionRow[] {
	const coreRows = Object.entries(config.extensions).map(([id, extension]) => ({
		id,
		kind: "core" as const,
		status: extension.enabled ? "enabled" as const : "disabled" as const,
		features: extension.features,
	}));
	const coreIds = new Set(coreRows.map((row) => row.id));
	const userRows = Object.entries(userConfig.extensions ?? {})
		.filter(([id]) => !coreIds.has(id))
		.map(([id, extension]) => ({
			id,
			kind: "third-party" as const,
			status: extension.enabled === false ? "disabled" as const : "enabled" as const,
			features: [],
		}));
	return [...coreRows, ...userRows].sort((a, b) => a.id.localeCompare(b.id));
}
