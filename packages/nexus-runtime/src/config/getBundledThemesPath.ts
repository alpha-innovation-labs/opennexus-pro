import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveBundledAssetPath } from "../package/resolveBundledAssetPath.js";

/**
 * Resolves the bundled themes directory path.
 *
 * @returns Absolute bundled themes directory path.
 */
export function getBundledThemesPath(): string {
  const bundledPath = resolveBundledAssetPath(import.meta.url, "theme", "./");
  return basename(bundledPath) === "themes" || basename(bundledPath) === "theme"
    ? bundledPath
    : join(bundledPath, "themes");
}
