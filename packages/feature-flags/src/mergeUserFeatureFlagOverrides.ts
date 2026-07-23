// This file is intentionally left as a no-op placeholder.
// User overrides are now applied inline in createExtensionFeatureFlags().
// This file remains for backwards compatibility with any external references.

/**
 * @deprecated Use createExtensionFeatureFlags() instead. User overrides
 * are now applied inline during flag creation.
 */
export function mergeUserFeatureFlagOverrides(): never {
	throw new Error("mergeUserFeatureFlagOverrides is deprecated — use createExtensionFeatureFlags()");
}
