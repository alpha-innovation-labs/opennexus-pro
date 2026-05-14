import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "./createReleaseTestEnv.js";
import { createReleaseTestHome } from "./createReleaseTestHome.js";
import { removeReleaseTestHome } from "./removeReleaseTestHome.js";
import { runCommand } from "./runCommand.js";
import { withLockedReleaseBuild } from "./withLockedReleaseBuild.js";

const PROJECT_ROOT = process.cwd();
const SOURCE_GENERATED_ASSET_PATH = join(
  PROJECT_ROOT,
  "packages/nexus-runtime/src/package/embedded-assets/generated/embeddedPackageAssets.ts",
);
const RELEASE_GENERATED_ASSET_PATH = join(PROJECT_ROOT, ".release/build/embeddedPackageAssets.ts");

test("release embedded asset module stays out of source and git", async () => {
  await withLockedReleaseBuild(async () => {
    const homeDir = await createReleaseTestHome();
    const env = createReleaseTestEnv(homeDir);

    try {
      const releaseResult = await runCommand("just release", {
        cwd: PROJECT_ROOT,
        env,
        timeoutMs: 300000,
      });

      assert.equal(releaseResult.timedOut, false);
      assert.equal(releaseResult.code, 0, releaseResult.output);
      assert.equal(existsSync(SOURCE_GENERATED_ASSET_PATH), false);
      assert.equal(existsSync(RELEASE_GENERATED_ASSET_PATH), true);

      const trackedSourceAssetResult = await runCommand(
        "git ls-files --error-unmatch packages/nexus-runtime/src/package/embedded-assets/generated/embeddedPackageAssets.ts",
        {
          cwd: PROJECT_ROOT,
          env,
          timeoutMs: 30000,
        },
      );
      const ignoredReleaseAssetResult = await runCommand("git check-ignore .release/build/embeddedPackageAssets.ts", {
        cwd: PROJECT_ROOT,
        env,
        timeoutMs: 30000,
      });

      assert.notEqual(trackedSourceAssetResult.code, 0, trackedSourceAssetResult.output);
      assert.equal(ignoredReleaseAssetResult.code, 0, ignoredReleaseAssetResult.output);
    } finally {
      await removeReleaseTestHome(homeDir);
    }
  });
});
