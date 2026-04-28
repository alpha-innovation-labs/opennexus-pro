/**
 * Disables source-only development entries for compiled production feature flags.
 *
 * @param {Record<string, any>} config Parsed root feature-flag config.
 * @returns {Record<string, any>} Production-safe feature-flag config.
 */
export function createCompiledFeatureFlagsConfig(config) {
  return {
    ...config,
    extensions: Object.fromEntries(
      Object.entries(config.extensions).map(([id, value]) => [
        id,
        {
          ...value,
          enabled: id === "dev" ? false : value.enabled,
        },
      ]),
    ),
  };
}
