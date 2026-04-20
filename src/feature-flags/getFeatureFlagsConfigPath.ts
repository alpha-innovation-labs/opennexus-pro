import { resolveBundledAssetPath } from "../runtime/package/resolveBundledAssetPath.js";

/**
 * Resolves the root feature-flags JSON path.
 *
 * @returns Absolute feature-flags config path.
 */
export function getFeatureFlagsConfigPath(): string {
  return resolveBundledAssetPath(import.meta.url, "feature-flags.json", "../../feature-flags.json");
}
