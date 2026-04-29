/**
 * Disables source-only development entries for compiled production feature flags.
 *
 * @param {Record<string, any>} config Parsed root feature-flag config.
 * @returns {Record<string, any>} Production-safe feature-flag config.
 */
export function createCompiledFeatureFlagsConfig(config) {
  return {
    ...config,
    extensions: createCompiledFeatureFlagCategory(config.extensions),
    other: createCompiledFeatureFlagCategory(config.other ?? {}),
  };
}

/**
 * Removes development-only entries from one feature-flag category.
 *
 * @param {Record<string, any>} category Parsed feature-flag category.
 * @returns {Record<string, any>} Production-safe category entries.
 */
function createCompiledFeatureFlagCategory(category) {
  return Object.fromEntries(
    Object.entries(category)
      .filter(([, value]) => !value.devOnly)
      .map(([id, value]) => [
        id,
        {
          ...value,
          enabled: value.enabled,
        },
      ]),
  );
}
