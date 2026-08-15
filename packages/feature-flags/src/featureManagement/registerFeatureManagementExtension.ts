import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerFeatureManagementExtensionWithConfig } from "./registerFeatureManagementExtensionWithConfig";

/**
 * Registers the feature management extension using the hardcoded registry.
 *
 * @param pi Extension API.
 */
export function registerFeatureManagementExtension(
	pi: ExtensionAPI,
): void {
	registerFeatureManagementExtensionWithConfig(pi);
}
