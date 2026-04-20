import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";
import { createReleaseTestEnv } from "./createReleaseTestEnv.js";
import { createReleaseTestHome } from "./createReleaseTestHome.js";
import { removeReleaseTestHome } from "./removeReleaseTestHome.js";
import { runCommand } from "./runCommand.js";
import { runReleaseAssetProbe } from "./runReleaseAssetProbe.js";
import { withLockedReleaseBuild } from "./withLockedReleaseBuild.js";

const PROJECT_ROOT = process.cwd();

test("released runtime assets keep node-pty and xterm-headless working", async () => {
  await withLockedReleaseBuild(async () => {
    const homeDir = await createReleaseTestHome();
    const env = createReleaseTestEnv(homeDir);
    const installedAppDir = join(homeDir, ".local", "share", "nexus");

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
      PI_PACKAGE_DIR: installedAppDir,
    }, [
      "import { createPtyManager } from './src/extensions/term-modal/pty/createPtyManager.ts';",
      "import { createXtermBuffer } from './src/extensions/term-modal/buffer/createXtermBuffer.ts';",
      "void (async () => {",
      "  const pty = createPtyManager();",
      "  pty.start(process.cwd(), 80, 24);",
      "  await new Promise((resolve) => setTimeout(resolve, 200));",
      "  console.log('ptyError=' + String(pty.error()));",
      "  console.log('ptyRunning=' + String(pty.isRunning()));",
      "  pty.kill();",
      "  const buffer = createXtermBuffer(80, 24, () => {});",
      "  buffer.write('hello\\r\\n');",
      "  await new Promise((resolve) => setTimeout(resolve, 50));",
      "  console.log('xtermLine=' + JSON.stringify(buffer.getDisplayLines(0, 2)));",
      "})().catch((error) => {",
      "  console.error(error);",
      "  process.exit(1);",
      "});",
    ].join("\n"));

    assert.match(output, /ptyError=null/);
    assert.match(output, /ptyRunning=true/);
      assert.match(output, /hello/);
    } finally {
      await removeReleaseTestHome(homeDir);
    }
  });
});
