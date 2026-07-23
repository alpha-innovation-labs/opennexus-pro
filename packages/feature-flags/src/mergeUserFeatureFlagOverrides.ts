import type { FeatureFlagsConfig, FeatureFlagConfig } from "./types.js";
import type { NexusUserConfig } from "@nexus/runtime/config/types.js";

/**
 * User-supplied feature-flag overrides from config.json.
 */
export type UserFeatureFlagOverride = {
  enabled?: boolean;
  devOnly?: boolean;
};

/**
 * Merges user feature-flag overrides from the Nexus user config into the base feature-flag config.
 *
 * Only the `enabled` and `devOnly` fields are user-overridable; `features` and `category`
 * remain read from the base config (feature-flags.json).
 *
 * @param base Static feature-flag config from feature-flags.json.
 * @param userConfig Parsed NexusUserConfig from ~/.config/nexus/config.json.
 * @returns Feature-flag config with user overrides applied.
 */
export function mergeUserFeatureFlagOverrides(
  base: FeatureFlagsConfig,
  userConfig: NexusUserConfig,
): FeatureFlagsConfig {
  const overrides: Record<string, UserFeatureFlagOverride> = userConfig.featureFlags ?? {};

  const mergeSection = (
    section: Record<string, FeatureFlagConfig> | undefined,
  ): Record<string, FeatureFlagConfig> | undefined => {
    if (!section) return undefined;
    return Object.fromEntries(
      Object.entries(section).map(([id, value]) => {
        const override = overrides[id];
        if (!override) return [id, value];
        return [
          id,
          {
            ...value,
            enabled: override.enabled ?? value.enabled,
            devOnly: override.devOnly ?? value.devOnly,
          },
        ];
      }),
    );
  };

  return {
    extensions: mergeSection(base.extensions),
    other: mergeSection(base.other),
  };
}
