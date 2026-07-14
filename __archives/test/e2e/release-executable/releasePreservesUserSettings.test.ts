import assert from "node:assert/strict";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "./createReleaseTestEnv.js";
import { createReleaseTestHome } from "./createReleaseTestHome.js";
import { getInstalledConfigDirPath } from "./getInstalledConfigDirPath.js";
import { removeReleaseTestHome } from "./removeReleaseTestHome.js";
import { runCommand } from "./runCommand.js";
import { withLockedReleaseBuild } from "./withLockedReleaseBuild.js";

const PROJECT_ROOT = process.cwd();

/**
 * Verifies release installation preserves preexisting user settings.
 */
test("just release preserves preexisting user settings", async () => {
  await withLockedReleaseBuild(async () => {
    const homeDir = await createReleaseTestHome();
    const env = createReleaseTestEnv(homeDir);
    const installedConfigDir = getInstalledConfigDirPath(homeDir);
    const installedSettingsPath = join(installedConfigDir, "settings.json");
    const userSettings = {
      theme: "light",
      editorPaddingX: 3,
      quietStartup: false,
      hideThinkingBlock: false,
      defaultProvider: "openai",
    };

    await mkdir(installedConfigDir, { recursive: true });
    await writeFile(installedSettingsPath, `${JSON.stringify(userSettings, null, 2)}\n`, "utf8");

    try {
      const releaseResult = await runCommand("just release", {
        cwd: PROJECT_ROOT,
        env,
        timeoutMs: 300000,
      });

      assert.equal(releaseResult.timedOut, false);
      assert.equal(releaseResult.code, 0, releaseResult.output);
      await access(installedSettingsPath);

      const persistedSettings = JSON.parse(await readFile(installedSettingsPath, "utf8")) as typeof userSettings;
      assert.deepEqual(persistedSettings, userSettings);
    } finally {
      await removeReleaseTestHome(homeDir);
    }
  });
});
