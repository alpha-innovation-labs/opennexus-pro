import assert from "node:assert/strict";
import test from "node:test";
import { createReleaseTestEnv } from "./createReleaseTestEnv.js";
import { createReleaseTestHome } from "./createReleaseTestHome.js";
import { getInstalledNexusPath } from "./getInstalledNexusPath.js";
import { removeReleaseTestHome } from "./removeReleaseTestHome.js";
import { runCommand } from "./runCommand.js";
import { runInteractiveCommandInPty } from "./runInteractiveCommandInPty.js";
import { withLockedReleaseBuild } from "./withLockedReleaseBuild.js";

const PROJECT_ROOT = process.cwd();

/**
 * Verifies the compiled release can load bundled extensions on startup.
 */
test("released nexus loads bundled extensions without regex failures", async () => {
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

      const output = await runInteractiveCommandInPty({
        command: `"${getInstalledNexusPath(homeDir)}" --no-session`,
        cwd: PROJECT_ROOT,
        env,
        startupDelayMs: 3000,
        input: "\u0003",
        afterInputDelayMs: 1000,
      });

      assert.doesNotMatch(output, /Invalid regular expression/);
      assert.doesNotMatch(output, /Failed to load extension/);
      assert.match(output, /NEXUS/);
    } finally {
      await removeReleaseTestHome(homeDir);
    }
  });
});
