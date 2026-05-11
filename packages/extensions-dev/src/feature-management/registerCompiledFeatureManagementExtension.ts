import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { registerFeatureManagementExtensionWithConfig } from "./registerFeatureManagementExtensionWithConfig.js";

/**
 * Registers the compiled-runtime feature management extension.
 *
 * @param pi Extension API.
 */
export function registerCompiledFeatureManagementExtension(pi: ExtensionAPI): void {
	registerFeatureManagementExtensionWithConfig(pi, getBundledFeatureFlagsConfig);
}
