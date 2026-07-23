import { bundledFeatureFlags, getAllBundledExtensionIds } from "@nexus/feature-flags/registry.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig.js";
import type { FeatureFlagConfigPatch } from "./updateFeatureFlagsConfig.js";
import type { FeatureProductCategory, FeatureStatusCategory, FeatureStatusRow } from "./types.js";
import { getFeatureManagementGroup } from "./getFeatureManagementGroup.js";

/**
 * Persists a feature flag disable/enable override to config.json.
 *
 * In the new system, the registry is hardcoded and enabled by default.
 * Users disable extensions by writing a `featureFlags.<id>.enabled: false`
 * entry to their `~/.config/nexus/config.json`.
 *
 * @param extensionId Extension/feature id to update.
 * @param enabled Whether the feature should be enabled (true = re-enable, false = disable).
 */
export function persistFeatureFlagOverride(extensionId: string, enabled: boolean): void {
	const config = readNexusUserConfig();

	if (!config.featureFlags) {
		config.featureFlags = {};
	}

	if (enabled) {
		// Remove the override — re-enable by returning to default (enabled).
		delete config.featureFlags[extensionId];
	} else {
		// Write disable override.
		config.featureFlags[extensionId] = { enabled: false };
	}

	writeNexusUserConfig(config);
}

/**
 * Flips the status of a feature row, persists the change to config.json,
 * then re-reads the full config and rebuilds ALL rows from scratch so
 * the UI always reflects the on-disk state.
 *
 * @param extensionId Extension/feature id.
 * @param patch Patch describing the change.
 * @param row Current display row.
 * @returns Updated rows (for UI refresh).
 */
export function updateFeatureStatusRow(
	extensionId: string,
	patch: FeatureFlagConfigPatch,
	row: FeatureStatusRow,
): FeatureStatusRow[] {
	const newStatus = patch.status === "disabled" ? false : true;
	persistFeatureFlagOverride(extensionId, newStatus);

	// Re-read config.json and rebuild ALL rows from scratch.
	const freshConfig = readNexusUserConfig();
	const freshOverrides: Record<string, { enabled?: boolean }> = freshConfig.featureFlags ?? {};
	const allIds = getAllBundledExtensionIds();

	return allIds.map((id) => {
		const entry = bundledFeatureFlags[id];
		if (!entry) {
			// Keep the old row if the extension was removed from the registry.
			return row.extensionId === id ? { ...row, status: (patch.status ?? row.status) as FeatureRuntimeStatus } : row;
		}
		const userOverride = freshOverrides[id];
		const enabled = userOverride?.enabled === false ? false : true;
		return {
			category: getFeatureStatusCategory(entry.category),
			sourceCategory: row.sourceCategory,
			extensionId: id,
			feature: id,
			status: enabled ? "enabled" : "disabled",
			group: getFeatureManagementGroup(id),
		} satisfies FeatureStatusRow;
	});
}

/**
 * Maps persisted product category metadata to the modal tab category.
 *
 * @param category Optional product category from feature-flags config.
 * @returns Feature-management tab category.
 */
function getFeatureStatusCategory(category: FeatureProductCategory | undefined): FeatureStatusCategory {
	if (category === "mini-app") return "mini-apps";
	if (category === "dev") return "dev";
	if (category === "pro") return "pro";
	return "core";
}
