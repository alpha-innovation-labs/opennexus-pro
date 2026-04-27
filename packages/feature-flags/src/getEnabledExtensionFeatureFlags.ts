import type { ExtensionFeatureFlag } from "./types.js";

/**
 * Filters the registry down to enabled extensions only.
 *
 * @param flags Full extension registry.
 * @returns Enabled extension flags.
 */
export function getEnabledExtensionFeatureFlags(flags: ExtensionFeatureFlag[]): ExtensionFeatureFlag[] {
  return flags.filter((flag) => flag.enabled);
}
