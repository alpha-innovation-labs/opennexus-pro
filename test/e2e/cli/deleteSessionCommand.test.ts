import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import test from "node:test";
import { createReleaseTestEnv } from "../release-executable/createReleaseTestEnv.js";
import { createReleaseTestHome } from "../release-executable/createReleaseTestHome.js";
import { removeReleaseTestHome } from "../release-executable/removeReleaseTestHome.js";
import { runCommand } from "../release-executable/runCommand.js";
import { buildSourceCliCommand } from "./buildSourceCliCommand.js";
import { createCliSessionFixture } from "./createCliSessionFixture.js";
import { pathExists } from "./pathExists.js";

test("nexus --delete-session <session-id> removes the persisted session", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);
  const { sessionDir, sessionId, sessionPath } = await createCliSessionFixture();

  try {
    const result = await runCommand(buildSourceCliCommand(["--session-dir", sessionDir, "--delete-session", sessionId]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 0);
    assert.match(result.output, new RegExp(`Deleted session ${sessionId}`));
    assert.equal(await pathExists(sessionPath), false);

    const listResult = await runCommand(buildSourceCliCommand(["--sessions", "--session-dir", sessionDir, "--json"]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });
    assert.equal(listResult.code, 0);
    assert.deepEqual(JSON.parse(listResult.output), []);
  } finally {
    await rm(sessionDir, { recursive: true, force: true });
    await removeReleaseTestHome(homeDir);
  }
});

test("nexus --delete-session exits with usage when the session id is missing", async () => {
  const homeDir = await createReleaseTestHome();
  const env = createReleaseTestEnv(homeDir);

  try {
    const result = await runCommand(buildSourceCliCommand(["--delete-session"]), {
      cwd: process.cwd(),
      env,
      timeoutMs: 25_000,
    });

    assert.equal(result.timedOut, false);
    assert.equal(result.code, 1);
    assert.match(result.output, /Usage: nexus --delete-session <session-id>/);
  } finally {
    await removeReleaseTestHome(homeDir);
  }
});
