import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "./createReleaseTestEnv.js";
import { createReleaseTestHome } from "./createReleaseTestHome.js";
import { getInstalledPackageDirPath } from "./getInstalledPackageDirPath.js";
import { removeReleaseTestHome } from "./removeReleaseTestHome.js";
import { runCommand } from "./runCommand.js";
import { withLockedReleaseBuild } from "./withLockedReleaseBuild.js";

const PROJECT_ROOT = process.cwd();

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

test("just release installs a binary-only npm package without app dist or src trees", async () => {
  await withLockedReleaseBuild(async () => {
    const homeDir = await createReleaseTestHome();
    const env = createReleaseTestEnv(homeDir);
    const installedPackageDir = getInstalledPackageDirPath(homeDir);

    try {
      const releaseResult = await runCommand("just release", {
        cwd: PROJECT_ROOT,
        env,
        timeoutMs: 300000,
      });

      assert.equal(releaseResult.timedOut, false);
      assert.equal(releaseResult.code, 0, releaseResult.output);
      assert.equal(await pathExists(join(installedPackageDir, "dist")), false);
      assert.equal(await pathExists(join(installedPackageDir, "src")), false);
      assert.equal(await pathExists(join(installedPackageDir, "nexus")), true);
      assert.equal(await pathExists(join(installedPackageDir, "runtime")), true);
      assert.equal(await pathExists(join(installedPackageDir, "runtime", "node_modules")), false);
      assert.equal(await pathExists(join(installedPackageDir, "node_modules", "node-pty")), true);
      assert.equal(await pathExists(join(installedPackageDir, "node_modules", "@xterm", "headless")), true);
      assert.equal(await pathExists(join(installedPackageDir, "theme")), true);
    } finally {
      await removeReleaseTestHome(homeDir);
    }
  });
});
