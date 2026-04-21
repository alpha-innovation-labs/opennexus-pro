import assert from "node:assert/strict";
import test from "node:test";
import { applyTelegramLiveStatusEvent } from "../../../../src/adapters/telegram/live-status/applyTelegramLiveStatusEvent.js";
import { createTelegramLiveStatusState } from "../../../../src/adapters/telegram/live-status/createTelegramLiveStatusState.js";

test("applyTelegramLiveStatusEvent tracks thinking and tool activity", () => {
  const state = createTelegramLiveStatusState();

  applyTelegramLiveStatusEvent(state, { type: "agent_start" });
  applyTelegramLiveStatusEvent(state, { type: "message_update", assistantMessageEvent: { type: "thinking_start" } });
  applyTelegramLiveStatusEvent(state, {
    type: "message_update",
    assistantMessageEvent: { type: "thinking_delta", delta: "Checking files\nMore detail" },
  });
  applyTelegramLiveStatusEvent(state, {
    type: "tool_execution_start",
    toolName: "read",
    args: { path: "src/index.ts" },
  });
  applyTelegramLiveStatusEvent(state, {
    type: "tool_execution_end",
    toolName: "read",
    args: { path: "src/index.ts" },
    isError: false,
  });

  assert.equal(state.thinkingLine, "Checking files");
  assert.deepEqual(state.toolLines, ["✓ read — path=\"src/index.ts\""]);
});
