import { mkdir, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const RELEASE_BUILD_LOCK_PATH = join(tmpdir(), "nexus-release-build-lock");

/**
 * Serializes release-build tests that mutate the shared .release workspace.
 *
 * @param run Test body needing exclusive release-build access.
 * @returns Result returned by the test body.
 */
export async function withLockedReleaseBuild<T>(run: () => Promise<T>): Promise<T> {
  for (;;) {
    try {
      await mkdir(RELEASE_BUILD_LOCK_PATH);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }

  try {
    return await run();
  } finally {
    await rmdir(RELEASE_BUILD_LOCK_PATH);
  }
}
