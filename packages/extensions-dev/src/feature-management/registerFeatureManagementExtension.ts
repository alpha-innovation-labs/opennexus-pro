import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readFeatureFlagsConfig } from "@nexus/feature-flags/readFeatureFlagsConfig.js";
import { registerFeatureManagementExtensionWithConfig } from "./registerFeatureManagementExtensionWithConfig.js";

/**
 * Registers the source-runtime feature management extension.
 *
 * @param pi Extension API.
 */
export function registerFeatureManagementExtension(pi: ExtensionAPI): void {
	registerFeatureManagementExtensionWithConfig(pi, readFeatureFlagsConfig);
}
