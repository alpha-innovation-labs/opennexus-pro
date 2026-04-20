import { rm } from "node:fs/promises";

/**
 * Removes an isolated HOME directory created for release e2e tests.
 *
 * @param homeDir Temporary HOME path.
 * @returns Promise that resolves after cleanup.
 */
export async function removeReleaseTestHome(homeDir: string): Promise<void> {
  await rm(homeDir, { recursive: true, force: true });
}
