import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";
import { createCliSessionFixture } from "./createCliSessionFixture.js";
import { createNexusCliSessionFixture } from "./createNexusCliSessionFixture.js";

test("nexus --sessions prints resumable session ids", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const { sessionDir, sessionId } = await createCliSessionFixture();

  try {
    const result = await runCommand(buildSourceCliCommand(["--sessions", "--session-dir", sessionDir]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    assert.deepEqual(result.output.trim().split(/\r?\n/).filter((line) => line.length > 0), [sessionId]);
  } finally {
    await rm(sessionDir, { recursive: true, force: true });
    await removeReleaseTestHome(homeDir);
  }
});

test("just sessions prints resumable session ids", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const { sessionId } = await createNexusCliSessionFixture(homeDir);

  try {
    const result = await runCommand("just sessions", {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    assert.deepEqual(result.output.trim().split(/\r?\n/).filter((line) => /^[0-9a-f-]+$/i.test(line)), [sessionId]);
  } finally {
    await removeReleaseTestHome(homeDir);
  }
});
