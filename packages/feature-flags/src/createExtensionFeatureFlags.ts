import { applySystemExtensionAvailability } from "./applySystemExtensionAvailability.js";
import { createExtensionRegisterMap } from "./createExtensionRegisterMap.js";
import { getBundledFeatureFlagsConfig } from "./getBundledFeatureFlagsConfig.js";
import { readFeatureFlagsConfig } from "./readFeatureFlagsConfig.js";
import { mergeUserFeatureFlagOverrides } from "./mergeUserFeatureFlagOverrides.js";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import type { ExtensionFeatureFlag, FeatureFlagsConfig } from "./types.js";

/**
 * Creates runtime extension flags from source config, falling back to bundled release config.
 *
 * @returns Extension flags with metadata and register handlers.
 */
export function createExtensionFeatureFlags(): ExtensionFeatureFlag[] {
	const config = applySystemExtensionAvailability(readAvailableFeatureFlagsConfig());
	const registerMap = createExtensionRegisterMap();

	return [
		...Object.entries(config.extensions),
		...Object.entries(config.other ?? {}).filter(([id]) => Boolean(registerMap[id])),
	].map(([id, value]) => {
		const register = registerMap[id];
		if (!register) {
			throw new Error(`Missing extension registration for feature flag: ${id}`);
		}
		return {
			id,
			enabled: value.enabled,
			features: value.features,
			register,
		} satisfies ExtensionFeatureFlag;
	});
}

/**
 * Reads source feature flags, applies user overrides from config.json,
 * and falls back to bundled release flags in installed runtimes.
 *
 * @returns Active feature flag config.
 */
function readAvailableFeatureFlagsConfig(): FeatureFlagsConfig {
	try {
		const base = readFeatureFlagsConfig();
		const userConfig = readNexusUserConfig();
		return mergeUserFeatureFlagOverrides(base, userConfig);
	} catch {
		return getBundledFeatureFlagsConfig();
	}
}
