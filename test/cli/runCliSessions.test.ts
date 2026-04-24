import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import test from "node:test";
import { runCliWithApp } from "../../src/cli/runCliWithApp.js";
import { createCliSessionFixture } from "./sessions/createCliSessionFixture.js";

test("runCliWithApp prints local sessions as a table for --sessions and skips app startup", async () => {
  const originalConsoleLog = console.log;
  const { sessionDir, sessionId } = await createCliSessionFixture();
  const output: string[] = [];
  let ranApp = false;

  console.log = (line?: unknown) => {
    output.push(String(line ?? ""));
  };

  try {
    const exitCode = await runCliWithApp(["--sessions", "--session-dir", sessionDir], {
      async runApp() {
        ranApp = true;
      },
    });

    assert.equal(exitCode, 0);
    assert.equal(ranApp, false);
    assert.match(output.join("\n"), /│ Date\s+│ Session title\s+│ Session ID\s+│/m);
    assert.match(output.join("\n"), new RegExp(`│ \\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2} │ CLI sessions fixture\\s+│ ${sessionId}\\s+│`, "m"));
  } finally {
    console.log = originalConsoleLog;
    await rm(sessionDir, { recursive: true, force: true });
  }
});
