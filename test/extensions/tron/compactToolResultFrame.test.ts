import assert from "node:assert/strict";
import test from "node:test";
import { resetThinkingToolBridge } from "../../../packages/extensions/src/tron/activity/resetThinkingToolBridge.js";
import { syncToolCallFrameState } from "../../../packages/extensions/src/tron/activity/syncToolCallFrameState.js";
import { CompactToolResult } from "../../../packages/extensions/src/tron/compact-tool-lines/CompactToolResult.js";

const theme = {
  fg: (_color: string, text: string): string => text,
};

const result = { content: [{ type: "text", text: "1" }] };

test.afterEach(() => {
  resetThinkingToolBridge();
});

test("compact tool result closes unsynced standalone tools by default", () => {
  const lines = new CompactToolResult("tool-1", result, true, theme).render(40);

  assert.match(lines.at(-1) ?? "", /^└/);
});

test("compact tool result does not close a tool followed by another tool", () => {
  syncToolCallFrameState([
    { type: "thinking", thinking: "Plan" },
    { type: "toolCall", id: "tool-1", name: "find" },
    { type: "toolCall", id: "tool-2", name: "read" },
  ]);

  const lines = new CompactToolResult("tool-1", result, true, theme).render(40);

  assert.doesNotMatch(lines.at(-1) ?? "", /^└/);
});

test("compact tool result closes the final tool in a group", () => {
  syncToolCallFrameState([
    { type: "thinking", thinking: "Plan" },
    { type: "toolCall", id: "tool-1", name: "find" },
  ]);

  const lines = new CompactToolResult("tool-1", result, true, theme).render(40);

  assert.match(lines.at(-1) ?? "", /^└/);
});
