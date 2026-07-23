import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerFeatureManagementExtensionWithConfig } from "./registerFeatureManagementExtensionWithConfig.js";

/**
 * Registers the feature management extension using the hardcoded registry.
 * This is the unified path — source and compiled modes are the same now.
 *
 * @param pi Extension API.
 */
export function registerCompiledFeatureManagementExtension(pi: ExtensionAPI): void {
	registerFeatureManagementExtensionWithConfig(pi);
}
