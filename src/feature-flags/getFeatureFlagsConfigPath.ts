import { fileURLToPath } from "node:url";

/**
 * Resolves the root feature-flags JSON path.
 *
 * @returns Absolute feature-flags config path.
 */
export function getFeatureFlagsConfigPath(): string {
  return fileURLToPath(new URL("../../feature-flags.json", import.meta.url));
}
