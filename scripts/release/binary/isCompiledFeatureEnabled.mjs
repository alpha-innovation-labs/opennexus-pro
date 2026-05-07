import { createCompiledFeatureFlagsConfig } from "../../feature-flags/createCompiledFeatureFlagsConfig.mjs";

/**
 * Checks whether a feature remains enabled in the production-safe compiled config.
 *
 * @param {Record<string, any>} rootConfig Parsed root feature-flag config.
 * @param {string} featureId Feature id to check.
 * @returns {boolean} True when the compiled release config enables the feature.
 */
export function isCompiledFeatureEnabled(rootConfig, featureId) {
  const compiledConfig = createCompiledFeatureFlagsConfig(rootConfig);
  return Boolean(compiledConfig.extensions?.[featureId]?.enabled ?? compiledConfig.other?.[featureId]?.enabled);
}
