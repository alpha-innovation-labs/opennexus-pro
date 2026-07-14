import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Regenerates the release-only feature-flag artifacts from feature-flags.json.
 */
export async function runFeatureFlagGenerators(): Promise<void> {
  await execFileAsync("npm", ["run", "generate:feature-flags"], { cwd: process.cwd() });
}
