import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "./createReleaseTestEnv.js";
import { createReleaseTestHome } from "./createReleaseTestHome.js";
import { getInstalledNexusPath } from "./getInstalledNexusPath.js";
import { removeReleaseTestHome } from "./removeReleaseTestHome.js";
import { runCommand } from "./runCommand.js";
import { runInteractiveCommandInPty } from "./runInteractiveCommandInPty.js";
import { setClipboardImageFromFile } from "./setClipboardImageFromFile.js";
import { withLockedReleaseBuild } from "./withLockedReleaseBuild.js";

const PROJECT_ROOT = process.cwd();

test("released nexus pastes clipboard images with ctrl+v when neo-editor is enabled", { skip: process.platform !== "darwin" }, async () => {
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

      await setClipboardImageFromFile(join(PROJECT_ROOT, "src", "chrome-extension", "icons", "icon16.png"));

      const output = await runInteractiveCommandInPty({
        command: `"${getInstalledNexusPath(homeDir)}" --no-session`,
        cwd: homeDir,
        env,
        startupDelayMs: 3000,
        input: "\u0016",
        afterInputDelayMs: 5000,
      });

      assert.match(output, /pi-clipboard-/);
    } finally {
      await removeReleaseTestHome(homeDir);
    }
  });
});
