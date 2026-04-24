import assert from "node:assert/strict";
import test from "node:test";
import { appendSubagentTranscriptEntry } from "../../../../src/extensions/sub-agents/runtime/appendSubagentTranscriptEntry.js";
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
  run.status = "running";
  run.client = {
    steer: async (message: string) => {
      messages.push(message);
    },
  } as never;
  sharedSubagentRuntime.setRun(run);

  await steerSubagentRun(run.id, "Wrap up with a summary");

  assert.deepEqual(messages, ["Wrap up with a summary"]);
});

/**
 * Verifies a completed run receives a fresh prompt instead of a mid-turn steer.
 */
test("steerSubagentRun sends a new prompt for completed child conversations", async () => {
  const prompts: string[] = [];
  const run = createSubagentRun(
    "Tell me a joke",
    { description: "[sub] Tell me a joke", subagentType: "Librarian", runInBackground: true },
    "/tmp/project",
  );
  run.status = "completed";
  run.completedAt = Date.now();
  appendSubagentTranscriptEntry(run, { role: "user", text: "Tell me a joke" });
  run.client = {
    prompt: async (message: string) => {
      prompts.push(message);
    },
    steer: async () => {
      throw new Error("steer should not be used for completed runs");
    },
  } as never;
  sharedSubagentRuntime.setRun(run);

  await steerSubagentRun(run.id, "Tell the joke in French");

  assert.deepEqual(prompts, ["Tell the joke in French"]);
  assert.deepEqual(
    run.transcript.filter((entry) => entry.role === "user").map((entry) => entry.text),
    ["Tell me a joke", "Tell the joke in French"],
  );
});
