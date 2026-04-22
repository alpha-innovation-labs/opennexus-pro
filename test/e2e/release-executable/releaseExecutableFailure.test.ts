import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "./createReleaseTestEnv.js";
import { createReleaseTestHome } from "./createReleaseTestHome.js";
import { getInstalledAgentDirPath } from "./getInstalledAgentDirPath.js";
import { getInstalledNexusPath } from "./getInstalledNexusPath.js";
import { getInstalledPackageDirPath } from "./getInstalledPackageDirPath.js";
import { removeReleaseTestHome } from "./removeReleaseTestHome.js";
import { runCommand } from "./runCommand.js";
import { withLockedReleaseBuild } from "./withLockedReleaseBuild.js";

const PROJECT_ROOT = process.cwd();

test("just release installs nexus without persisting shipped defaults into user settings", async () => {
  await withLockedReleaseBuild(async () => {
    const homeDir = await createReleaseTestHome();
    const env = createReleaseTestEnv(homeDir);

    try {
      const firstReleaseResult = await runCommand("just release", {
        cwd: PROJECT_ROOT,
        env,
        timeoutMs: 300000,
      });

      assert.equal(firstReleaseResult.timedOut, false);
      assert.equal(firstReleaseResult.code, 0, firstReleaseResult.output);

      const secondReleaseResult = await runCommand("just release", {
        cwd: PROJECT_ROOT,
        env,
        timeoutMs: 300000,
      });

      assert.equal(secondReleaseResult.timedOut, false);
      assert.equal(secondReleaseResult.code, 0, secondReleaseResult.output);

      const nexusPath = getInstalledNexusPath(homeDir);
      await access(nexusPath);

      const installedAgentDir = getInstalledAgentDirPath(homeDir);
      const installedSettingsPath = join(installedAgentDir, "settings.json");
      await assert.rejects(access(installedSettingsPath));
      await access(join(installedAgentDir, "editor-triggers.json"));

      const installedPackageDir = getInstalledPackageDirPath(homeDir);
      await access(join(installedPackageDir, "src", "runtime", "config", "default-settings", "settings.json"));

      const promptResult = await runCommand(`"${nexusPath}" -p hello`, {
        cwd: installedPackageDir,
        env,
        timeoutMs: 20000,
      });

      assert.equal(promptResult.timedOut, false);
      assert.doesNotMatch(promptResult.output, /ENOENT/);
      assert.doesNotMatch(promptResult.output, /dist\/modes\/interactive\/theme\/dark\.json/);
      assert.doesNotMatch(promptResult.output, /pi summarizer failed/);
    } finally {
      await removeReleaseTestHome(homeDir);
    }
  });
});
