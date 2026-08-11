import type { MiniAppManifest } from "./MiniAppManifest";

/**
 * Finds the mini-app manifest that owns a user-facing command.
 *
 * @param manifests Candidate mini-app manifests.
 * @param argv Raw CLI arguments.
 * @returns Matching mini-app manifest, or undefined.
 */
export function findMiniAppCommand(
	manifests: MiniAppManifest[],
	argv: readonly string[],
): MiniAppManifest | undefined {
	return manifests.find((manifest) => manifest.isCommand(argv));
}
