import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig";
import { applySystemExtensionAvailability } from "./applySystemExtensionAvailability";
import { createExtensionRegisterMap } from "./createExtensionRegisterMap";
import { bundledFeatureFlags, getAllBundledExtensionIds } from "./registry";
import type { ExtensionFeatureFlag } from "./types";

/**
 * Creates runtime extension flags from the hardcoded registry,
 * applies user overrides from config.json, and applies system checks.
 *
 * @returns Extension flags with metadata and register handlers.
 */
export function createExtensionFeatureFlags(): ExtensionFeatureFlag[] {
	const registerMap = createExtensionRegisterMap();
	const userConfig = readNexusUserConfig();
	const userOverrides: Record<string, boolean> = userConfig.featureFlags ?? {};

	// Build flags from the hardcoded registry, applying user overrides and system checks.
	const flags = getAllBundledExtensionIds().map((id) => {
		const entry = bundledFeatureFlags[id];
		if (!entry) {
			throw new Error(`Missing hardcoded registry entry for extension: ${id}`);
		}
		const register = registerMap[id];
		if (!register) {
			throw new Error(`Missing extension registration for feature flag: ${id}`);
		}

		// Apply user override (disable-only).
		const userOverride = userOverrides[id];
		const enabled = userOverride !== false;

		return {
			id,
			enabled,
			features: entry.features,
			register,
		} satisfies ExtensionFeatureFlag;
	});

	// Apply system-level checks (e.g., cmux availability).
	return applySystemExtensionAvailability(flags);
}
