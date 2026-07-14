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

test("released nexus opens /context without module resolution failures", async () => {
  await withLockedReleaseBuild(async () => {
    const homeDir = await createReleaseTestHome();
    const env = {
      ...createReleaseTestEnv(homeDir),
      ANTHROPIC_API_KEY: "test-key",
      OPENAI_API_KEY: "test-key",
    };

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
        input: "/context\r",
        afterInputDelayMs: 5000,
        cols: 120,
        rows: 40,
      });

      assert.doesNotMatch(output, /Cannot find module '@earendil-works\/pi-coding-agent'/u);
      assert.doesNotMatch(output, /\/\$bunfs\/root\/nexus/u);
      assert.doesNotMatch(output, /Extension "command:context" error/u);
      assert.match(output, /Context Usage/u);
    } finally {
      await removeReleaseTestHome(homeDir);
    }
  });
});
