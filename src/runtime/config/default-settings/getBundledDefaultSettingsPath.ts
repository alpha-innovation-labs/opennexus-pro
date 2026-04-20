import { resolveBundledAssetPath } from "../../package/resolveBundledAssetPath.js";

/**
 * Resolves the bundled Nexus app-default settings asset path.
 *
 * @returns Absolute default-settings asset path.
 */
export function getBundledDefaultSettingsPath(): string {
  return resolveBundledAssetPath(import.meta.url, "defaults/settings.json", "../../../../defaults/settings.json");
}
