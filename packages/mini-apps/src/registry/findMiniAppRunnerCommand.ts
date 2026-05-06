import type { MiniAppManifest } from "./MiniAppManifest.js";

/**
 * Finds the mini-app manifest that owns an internal runner command.
 *
 * @param manifests Candidate mini-app manifests.
 * @param argv Raw CLI arguments.
 * @returns Matching mini-app manifest, or undefined.
 */
export function findMiniAppRunnerCommand(manifests: MiniAppManifest[], argv: readonly string[]): MiniAppManifest | undefined {
	return manifests.find((manifest) => manifest.isRunnerCommand(argv));
}
