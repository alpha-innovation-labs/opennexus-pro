import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { readFeatureFlagsConfig } from "../../feature-flags/readFeatureFlagsConfig.js";
import { registerFeatureManagementExtensionWithConfig } from "./registerFeatureManagementExtensionWithConfig.js";

/**
 * Registers the source-runtime feature management extension.
 *
 * @param pi Extension API.
 */
export function registerFeatureManagementExtension(pi: ExtensionAPI): void {
	registerFeatureManagementExtensionWithConfig(pi, readFeatureFlagsConfig);
}
