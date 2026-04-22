import assert from "node:assert/strict";
import test from "node:test";
import { createSubagentRun } from "../../../../src/extensions/sub-agents/runtime/createSubagentRun.js";
import { sharedSubagentRuntime } from "../../../../src/extensions/sub-agents/runtime/sharedSubagentRuntime.js";
import { steerSubagentRun } from "../../../../src/extensions/sub-agents/runtime/steerSubagentRun.js";

test("steerSubagentRun queues steering messages before the child client exists", async () => {
  const run = createSubagentRun(
    "scan files",
    { description: "[sub] Scan files", subagentType: "Explore", runInBackground: true },
    "/tmp/project",
  );
  sharedSubagentRuntime.setRun(run);

  await steerSubagentRun(run.id, "Focus on package.json");

  assert.deepEqual(run.pendingSteers, ["Focus on package.json"]);
});

test("steerSubagentRun forwards steering to an active child client", async () => {
  const messages: string[] = [];
  const run = createSubagentRun(
    "scan files",
    { description: "[sub] Scan files", subagentType: "Explore", runInBackground: true },
    "/tmp/project",
  );
  run.client = {
    steer: async (message: string) => {
      messages.push(message);
    },
  } as never;
  sharedSubagentRuntime.setRun(run);

  await steerSubagentRun(run.id, "Wrap up with a summary");

  assert.deepEqual(messages, ["Wrap up with a summary"]);
});
