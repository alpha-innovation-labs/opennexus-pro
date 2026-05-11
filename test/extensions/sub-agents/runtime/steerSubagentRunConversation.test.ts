import assert from "node:assert/strict";
import test from "node:test";
import { appendSubagentTranscriptEntry } from "../../../../packages/extension-core/src/sub-agents/runtime/appendSubagentTranscriptEntry.js";
import { createSubagentRun } from "../../../../packages/extension-core/src/sub-agents/runtime/createSubagentRun.js";
import { sharedSubagentRuntime } from "../../../../packages/extension-core/src/sub-agents/runtime/sharedSubagentRuntime.js";
import { createSteerSubagentTool } from "../../../../packages/extension-core/src/sub-agents/tooling/createSteerSubagentTool.js";

/**
 * Resets the shared runtime between steering assertions.
 */
function resetRuntime(): void {
  sharedSubagentRuntime.clear();
}

test.beforeEach(() => {
  resetRuntime();
});

test.after(() => {
  resetRuntime();
});

/**
 * Verifies the steer tool keeps the same conversation and appends the follow-up user message next.
 */
test("steer_subagent appends a second user message to the same conversation", async () => {
  const run = createSubagentRun(
    "Tell me a joke",
    { description: "Librarian joke", subagentType: "Librarian", runInBackground: true },
    "/workspace/project",
  );
  run.id = "run-1";
  appendSubagentTranscriptEntry(run, { role: "user", text: "Tell me a joke" });
  sharedSubagentRuntime.setRun(run);

  const tool = createSteerSubagentTool();
  const result = await tool.execute("tool-1", {
    agent_id: run.id,
    message: "Tell the joke in French",
  });

  assert.match(result.content[0].text, /Steered subagent run-1/);
  assert.deepEqual(
    run.transcript.filter((entry) => entry.role === "user").map((entry) => entry.text),
    ["Tell me a joke", "Tell the joke in French"],
  );
});
