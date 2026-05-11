import assert from "node:assert/strict";
import test from "node:test";
import { createReleaseTestEnv } from "./createReleaseTestEnv.js";
import { createReleaseTestHome } from "./createReleaseTestHome.js";
import { getInstalledPackageDirPath } from "./getInstalledPackageDirPath.js";
import { removeReleaseTestHome } from "./removeReleaseTestHome.js";
import { runCommand } from "./runCommand.js";
import { runReleaseAssetProbe } from "./runReleaseAssetProbe.js";
import { withLockedReleaseBuild } from "./withLockedReleaseBuild.js";

const PROJECT_ROOT = process.cwd();

test("released runtime assets keep fff working", async () => {
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

    const output = await runReleaseAssetProbe(PROJECT_ROOT, {
      ...env,
      PI_PACKAGE_DIR: installedPackageDir,
    }, [
      "import { loadFffNode } from './packages/extension-core/src/fff/runtime/loadFffNode.ts';",
      "void (async () => {",
      "  const fff = await loadFffNode();",
      "  console.log('fffFileFinder=' + typeof fff.FileFinder?.create);",
      "})().catch((error) => {",
      "  console.error(error);",
      "  process.exit(1);",
      "});",
    ].join("\n"));

      assert.match(output, /fffFileFinder=function/);
    } finally {
      await removeReleaseTestHome(homeDir);
    }
  });
});
