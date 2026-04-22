import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import test from "node:test";
import { runCliWithApp } from "../../src/cli/runCliWithApp.js";
import { createCliSessionFixture } from "./sessions/createCliSessionFixture.js";

test("runCliWithApp prints local session ids for --sessions and skips app startup", async () => {
  const originalConsoleLog = console.log;
  const { sessionDir } = await createCliSessionFixture();
  let ranApp = false;

  console.log = () => undefined;

  try {
    const exitCode = await runCliWithApp(["--sessions", "--session-dir", sessionDir], {
      async runApp() {
        ranApp = true;
      },
    });

    assert.equal(exitCode, 0);
    assert.equal(ranApp, false);
  } finally {
    console.log = originalConsoleLog;
    await rm(sessionDir, { recursive: true, force: true });
  }
});
