import type { FeatureFlagsConfig } from "../../../src/feature-flags/types.js";

/**
 * Creates a copy of the config with only the requested extension ids enabled.
 *
 * @param config Source feature-flag config.
 * @param enabledIds Extension ids to mark enabled.
 * @returns Updated feature-flag config copy.
 */
export function createModifiedFeatureFlagsConfig(
  config: FeatureFlagsConfig,
  enabledIds: string[],
): FeatureFlagsConfig {
  const enabledIdSet = new Set(enabledIds);

  return {
    extensions: Object.fromEntries(
      Object.entries(config.extensions).map(([id, value]) => [
        id,
        {
          ...value,
          enabled: enabledIdSet.has(id),
        },
      ]),
    ),
  };
}
