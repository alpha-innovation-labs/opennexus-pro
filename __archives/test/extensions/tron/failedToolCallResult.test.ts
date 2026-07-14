import assert from "node:assert/strict";
import test from "node:test";
import { resetThinkingToolBridge } from "../../../packages/extension-core/src/tron/activity/resetThinkingToolBridge.js";
import { syncToolCallFrameState } from "../../../packages/extension-core/src/tron/activity/syncToolCallFrameState.js";
import { FailedToolCallResult } from "../../../packages/extension-core/src/tron/compact-tool-lines/FailedToolCallResult.js";

const theme = {
  fg(color: string, text: string): string {
    return `[${color}]${text}[/${color}]`;
  },
  bold(text: string): string {
    return `[bold]${text}[/bold]`;
  },
};

test.afterEach(() => {
  resetThinkingToolBridge();
});

test("failed tool call result applies error styling only to the error text", () => {
  const lines = new FailedToolCallResult("tool-1", "read", "Permission denied", theme).render(40);

  assert.equal(lines.length, 3);
  assert.match(lines[0], /^\[borderMuted\]┌/);
  assert.match(lines[1], /^\[borderMuted\]│\[\/borderMuted\].*\[text\]\[bold\]read\[\/bold\]\[\/text\] \[error\]Permission denied\[\/error\] *\[borderMuted\]│\[\/borderMuted\]$/);
  assert.match(lines[2], /^\[borderMuted\]└/);
});

test("failed tool call result omits borders for synced middle tools", () => {
  syncToolCallFrameState([
    { type: "thinking", thinking: "Plan" },
    { type: "toolCall", id: "tool-1", name: "read" },
    { type: "toolCall", id: "tool-2", name: "grep" },
  ]);

  const lines = new FailedToolCallResult("tool-1", "read", "Permission denied", theme).render(40);

  assert.equal(lines.length, 1);
  assert.match(lines[0], /^\[borderMuted\]│/);
});
