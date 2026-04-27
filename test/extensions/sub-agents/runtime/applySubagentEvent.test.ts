import test from "node:test";
import assert from "node:assert/strict";
import { createSubagentRun } from "../../../../packages/extensions/src/sub-agents/runtime/createSubagentRun.js";
import { applySubagentEvent } from "../../../../packages/extensions/src/sub-agents/runtime/applySubagentEvent.js";

/**
 * Verifies text, thinking, and tool state updates from RPC events.
 */
test("applySubagentEvent tracks live message and tool state", () => {
  const run = createSubagentRun("scan files", {
    description: "Explore",
    subagentType: "Explore",
  }, "/tmp/project");

  applySubagentEvent(run, { type: "agent_start" });
  applySubagentEvent(run, { type: "message_update", assistantMessageEvent: { type: "thinking_delta", delta: "thinking" } });
  applySubagentEvent(run, { type: "tool_execution_start", toolName: "read", args: { path: "a.ts" } });
  applySubagentEvent(run, {
    type: "tool_execution_update",
    partialResult: { content: [{ type: "text", text: "live output" }] },
  });
  applySubagentEvent(run, { type: "tool_execution_end", toolName: "read", result: { content: [] }, isError: false });
  applySubagentEvent(run, {
    type: "message_end",
    message: { role: "assistant", content: [{ type: "text", text: "done" }] },
  });
  applySubagentEvent(run, { type: "agent_end" });

  assert.equal(run.status, "completed");
  assert.equal(run.resultText, "done");
  assert.equal(run.toolCalls, 1);
  assert.equal(run.activeTool, null);
  assert.equal(run.transcript.some((entry) => entry.role === "tool"), true);
  assert.equal(run.transcript.some((entry) => entry.role === "thinking"), true);
  assert.equal(run.transcript.some((entry) => entry.role === "assistant" && entry.text === "done"), true);
});
