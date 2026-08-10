import type { FeatureFlagConfig } from "./types";

/**
 * Reports whether a feature flag should be exposed by non-development runtime surfaces.
 *
 * @param value Feature-flag value to inspect.
 * @returns True when the feature is enabled and not marked development-only.
 */
export function isRuntimeFeatureAvailable(value: FeatureFlagConfig | undefined): boolean {
  return value?.enabled === true && value.devOnly !== true;
}
