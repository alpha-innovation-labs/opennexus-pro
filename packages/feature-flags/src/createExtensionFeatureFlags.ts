import { applySystemExtensionAvailability } from "./applySystemExtensionAvailability.js";
import { applyUserExtensionConfig } from "./applyUserExtensionConfig.js";
import { createExtensionRegisterMap } from "./createExtensionRegisterMap.js";
import { getBundledFeatureFlagsConfig } from "./getBundledFeatureFlagsConfig.js";
import { readFeatureFlagsConfig } from "./readFeatureFlagsConfig.js";
import type { ExtensionFeatureFlag, FeatureFlagsConfig } from "./types.js";

/**
 * Creates runtime extension flags from source config, falling back to bundled release config.
 *
 * @returns Extension flags with metadata and register handlers.
 */
export function createExtensionFeatureFlags(): ExtensionFeatureFlag[] {
	const config = applySystemExtensionAvailability(applyUserExtensionConfig(readAvailableFeatureFlagsConfig()));
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
 * Reads source feature flags and falls back to compiled bundled flags in installed runtimes.
 *
 * @returns Active feature flag config.
 */
function readAvailableFeatureFlagsConfig(): FeatureFlagsConfig {
	try {
		return readFeatureFlagsConfig();
	} catch {
		return getBundledFeatureFlagsConfig();
	}
}
