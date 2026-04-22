import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Regenerates the release-only feature-flag artifacts from feature-flags.json.
 *
 * @returns Promise that resolves when both generators finish.
 */
export async function runFeatureFlagGenerators(): Promise<void> {
  await execFileAsync("node", ["scripts/feature-flags/generateCompiledFeatureFlags.mjs"]);
  await execFileAsync("node", ["scripts/feature-flags/generateCompiledBundledExtensions.mjs"]);
}
