import { basename, join } from "node:path";
import { resolveBundledAssetPath } from "../package/resolveBundledAssetPath";

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
