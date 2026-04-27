import assert from "node:assert/strict";
import test from "node:test";
import { createSubagentRun } from "../../../../packages/extensions/src/sub-agents/runtime/createSubagentRun.js";
import { sharedSubagentRuntime } from "../../../../packages/extensions/src/sub-agents/runtime/sharedSubagentRuntime.js";
import { waitForSubagentCompletion } from "../../../../packages/extensions/src/sub-agents/runtime/waitForSubagentCompletion.js";

test("waitForSubagentCompletion resolves for queued runs once persisted status becomes terminal", async () => {
  const run = createSubagentRun(
    "scan files",
    { description: "[sub] Scan files", subagentType: "Explore", runInBackground: true },
    "/tmp/project",
  );
  sharedSubagentRuntime.setRun(run);

  const waiting = waitForSubagentCompletion(run);
  setTimeout(() => {
    run.status = "completed";
    sharedSubagentRuntime.setRun(run);
  }, 20);

  await waiting;
  assert.equal(run.status, "completed");
});
