import type { ConfiguredPackage } from "../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/package-manager.js";
import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";
import type { NexusUserConfig } from "@nexus/runtime/config/types.js";
import { createConfiguredPackageRows } from "../package/createConfiguredPackageRows.js";
import type { ManagedExtensionRow } from "./types.js";
import { sortManagedExtensionRows } from "./sortManagedExtensionRows.js";

/**
 * Creates extension manager rows for core bundled and user-installed extensions.
 *
 * @param config Bundled feature flag config.
 * @param userConfig User config with extension preferences.
 * @param packages Configured package manager entries from Nexus settings.
 * @returns Sorted extension rows for display.
 */
export function createManagedExtensionRows(config: FeatureFlagsConfig, userConfig: NexusUserConfig, packages: ConfiguredPackage[] = []): ManagedExtensionRow[] {
	const coreRows = Object.entries(config.extensions).map(([id, extension]) => ({
		id,
		kind: "core" as const,
		status: extension.enabled ? "enabled" as const : "disabled" as const,
		features: extension.features,
		rowType: "extension" as const,
	}));
	const coreIds = new Set(coreRows.map((row) => row.id));
	const packageRows = createConfiguredPackageRows(packages, userConfig);
	const packageIds = new Set(packageRows.map((row) => row.id));
	const userRows = Object.entries(userConfig.extensions ?? {})
		.filter(([id]) => !coreIds.has(id) && !packageIds.has(id))
		.map(([id, extension]) => ({
			id,
			kind: "third-party" as const,
			status: extension.enabled === false ? "disabled" as const : "enabled" as const,
			features: [],
			rowType: "extension" as const,
		}));
	return sortManagedExtensionRows([...coreRows, ...packageRows, ...userRows]);
}
