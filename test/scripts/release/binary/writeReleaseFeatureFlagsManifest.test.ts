import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { writeReleaseFeatureFlagsManifest } from "../../../../scripts/release/binary/writeReleaseFeatureFlagsManifest.mjs";

/**
 * Reads a JSON file from disk.
 *
 * @param path File path.
 * @returns Parsed JSON value.
 */
async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8"));
}

test("writeReleaseFeatureFlagsManifest creates release-visible compiled flag files", async () => {
  const targetRoot = await mkdtemp(join(tmpdir(), "nexus-release-flags-"));

  try {
    await writeReleaseFeatureFlagsManifest(targetRoot, {
      extensions: {
        stable: { enabled: true, features: ["stable feature"] },
        hidden: { enabled: true, devOnly: true, features: ["hidden feature"] },
        off: { enabled: false, features: ["off feature"] },
      },
    });

    const config = await readJson(join(targetRoot, "runtime", "feature-flags", "compiled-feature-flags.json"));
    const enabled = await readJson(join(targetRoot, "runtime", "feature-flags", "compiled-enabled-extensions.json"));

    assert.deepEqual(enabled, { extensionIds: ["stable"] });
    assert.equal((config as { extensions: Record<string, { enabled: boolean }> }).extensions.hidden.enabled, false);
  } finally {
    await rm(targetRoot, { recursive: true, force: true });
  }
});
