import { mkdir, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FEATURE_FLAGS_LOCK_PATH = join(tmpdir(), "nexus-feature-flags-lock");

/**
 * Serializes tests that mutate the shared root feature-flags.json file.
 *
 * @param run Test body that needs exclusive access to feature-flags.json.
 * @returns Result returned by the test body.
 */
export async function withLockedFeatureFlagsConfig<T>(run: () => Promise<T>): Promise<T> {
  for (;;) {
    try {
      await mkdir(FEATURE_FLAGS_LOCK_PATH);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }

  try {
    return await run();
  } finally {
    await rmdir(FEATURE_FLAGS_LOCK_PATH);
  }
}
