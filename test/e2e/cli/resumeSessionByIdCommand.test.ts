import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";
import { createCliSessionFixture } from "./createCliSessionFixture.js";

test("nexus --resume <session-id> opens the requested session directly", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const { sessionDir, sessionId } = await createCliSessionFixture();

  try {
    const result = await runCommand(buildSourceCliCommand(["--session-dir", sessionDir, "--resume", sessionId]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 8_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    assert.match(result.output, /CLI resume fixture/);
    assert.match(result.output, /CLI resume assistant/);
  } finally {
    await rm(sessionDir, { recursive: true, force: true });
    await removeReleaseTestHome(homeDir);
  }
});
