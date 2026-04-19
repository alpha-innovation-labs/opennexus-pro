import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createExtensionFeatureFlags, registerEnabledExtensions } from "../feature-flags/index.js";

export { createExtensionFeatureFlags, createExtensionFeatureFlagReport, getEnabledExtensionFeatureFlags, readFeatureFlagsConfig } from "../feature-flags/index.js";

/**
 * Central extension entrypoint.
 *
 * @param pi Pi extension API.
 */
export default function index(pi: ExtensionAPI): void {
	registerEnabledExtensions(pi, createExtensionFeatureFlags());
}
