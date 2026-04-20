import { applySystemExtensionAvailability } from "./applySystemExtensionAvailability.js";
import { createExtensionRegisterMap } from "./createExtensionRegisterMap.js";
import { readFeatureFlagsConfig } from "./readFeatureFlagsConfig.js";
import type { ExtensionFeatureFlag } from "./types.js";

/**
 * Creates runtime extension flags from the root JSON config.
 *
 * @returns Extension flags with metadata and register handlers.
 */
export function createExtensionFeatureFlags(): ExtensionFeatureFlag[] {
  const config = applySystemExtensionAvailability(readFeatureFlagsConfig());
  const registerMap = createExtensionRegisterMap();

  return Object.entries(config.extensions).map(([id, value]) => {
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
