import { resolveBundledAssetPath } from "../package/resolveBundledAssetPath";

/**
 * Resolves the bundled Nexus prompt-template directory path.
 *
 * @returns Absolute bundled command directory path.
 */
export function getBundledCommandsPath(): string {
	return resolveBundledAssetPath(import.meta.url, "commands", "./");
}
