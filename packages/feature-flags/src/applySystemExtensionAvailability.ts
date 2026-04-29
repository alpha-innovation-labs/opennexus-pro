import { isCmuxCommandAvailable } from "@nexus/extensions/cmux/runtime/isCmuxCommandAvailable.js";
import type { FeatureFlagsConfig } from "./types.js";

/**
 * Applies runtime extension availability overrides for the current system.
 *
 * @param config Static feature-flag config.
 * @returns Feature-flag config with runtime availability applied.
 */
export function applySystemExtensionAvailability(config: FeatureFlagsConfig): FeatureFlagsConfig {
  const cmuxAvailable = isCmuxCommandAvailable();

  return {
    ...config,
    extensions: Object.fromEntries(
      Object.entries(config.extensions).map(([id, value]) => [
        id,
        {
          ...value,
          enabled: id === "cmux" ? value.enabled && cmuxAvailable : value.enabled,
        },
      ]),
    ),
  };
}
