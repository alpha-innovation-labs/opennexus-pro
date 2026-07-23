import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig.js";
import type { FeatureFlagConfigPatch } from "./updateFeatureFlagsConfig.js";
import type { FeatureStatusRow } from "./types.js";

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
 * Flips the status of a feature row and persists the change.
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
	return [
		{
			...row,
			status: newStatus ? "enabled" : "disabled",
		},
	];
}
