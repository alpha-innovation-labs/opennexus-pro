import type { FeatureManagementGroup } from "./types";

/**
 * Maps a feature id to its group label.
 *
 * Mini-apps go to "Mini apps".
 * Bundled extensions in the minimal whitelist go to "Core".
 * All other bundled extensions go to "Nexus".
 * External Pi Packages (npm: or pi- prefixed) go to "Pi Packages".
 *
 * @param featureId Extension/feature id.
 * @param minimalWhitelist Extensions whitelisted by --minimal. Undefined means Core mode is disabled.
 * @returns Group label for the feature row.
 */
export function getFeatureManagementGroup(
	featureId: string,
	minimalWhitelist?: readonly string[],
): FeatureManagementGroup {
	// Mini-apps first.
	const knownMiniApps = new Set(["tetris"]);
	if (knownMiniApps.has(featureId)) return "Mini apps";
	// External Pi Packages: scoped npm (@scope/name), npm:, or pi- prefixed.
	if (featureId.startsWith("npm:") || featureId.startsWith("pi-") || featureId.startsWith("@")) return "Pi Packages";
	// Bundled extensions: Core if whitelisted by --minimal, otherwise Nexus.
	if (minimalWhitelist?.includes(featureId)) return "Core";
	return "Nexus";
}
