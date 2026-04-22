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
 * Verifies non-empty `@` file autocomplete does not crash the released app.
 */
test("released nexus keeps running when typing @/", async () => {
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
        input: "@/",
        afterInputDelayMs: 4000,
      });

      assert.doesNotMatch(output, /fff unavailable/);
      assert.doesNotMatch(output, /Cannot find module/);
      assert.match(output, /@\//);
    } finally {
      await removeReleaseTestHome(homeDir);
    }
  });
});
