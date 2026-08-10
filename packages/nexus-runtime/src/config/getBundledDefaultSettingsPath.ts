import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolves the bundled Nexus app-default settings asset path.
 *
 * @returns Absolute default-settings asset path.
 */
export function getBundledDefaultSettingsPath(): string {
  // In a bundled binary, assets are extracted to PI_PACKAGE_DIR.
  if (process.env.PI_PACKAGE_DIR) {
    return join(process.env.PI_PACKAGE_DIR, "runtime", "config", "default-settings", "settings.json");
  }

  // Use source-relative resolution so this works in dev mode regardless of
  // which package PI_PACKAGE_DIR currently points to.
  const selfDir = dirname(fileURLToPath(import.meta.url));
  return `${selfDir}/default-settings/settings.json`;
}
