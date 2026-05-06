import assert from "node:assert/strict";
import test from "node:test";
import { bridgeThinkingToToolCalls } from "../../../packages/extensions/src/tron/activity/bridgeThinkingToToolCalls.js";
import { resetThinkingToolBridge } from "../../../packages/extensions/src/tron/activity/resetThinkingToolBridge.js";
import { syncToolCallFrameState } from "../../../packages/extensions/src/tron/activity/syncToolCallFrameState.js";
import { SingleLineToolCall } from "../../../packages/extensions/src/tron/compact-tool-lines/SingleLineToolCall.js";

const theme = {
  fg: (_color: string, text: string) => text,
  bold: (text: string) => text,
};

/**
 * Removes ANSI escape sequences from rendered test lines.
 *
 * @param value Rendered line.
 * @returns Plain line.
 */
function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
}

/**
 * Creates a compact tool-call row for render-cache tests.
 *
 * @returns Single-line tool-call component.
 */
function createToolCall(toolCallId = "tool-1"): SingleLineToolCall {
  return new SingleLineToolCall(
    toolCallId,
    "read",
    { main: "src/index.ts", options: "42 lines" },
    theme,
    false,
  );
}

test.afterEach(() => {
  resetThinkingToolBridge();
});

test("single-line tool call reuses cached lines for unchanged width", () => {
  const toolCall = createToolCall();

  const first = toolCall.render(80);
  const second = toolCall.render(80);

  assert.equal(second, first);
});

test("single-line tool call refreshes cached lines when width changes", () => {
  const toolCall = createToolCall();

  const first = toolCall.render(80);
  const second = toolCall.render(40);

  assert.notEqual(second, first);
});

test("single-line tool call renders top and bottom borders when it is the only activity", () => {
  syncToolCallFrameState([{ type: "toolCall", id: "tool-1", name: "read" }]);
  const lines = createToolCall("tool-1").render(40).map(stripAnsi);

  assert.match(lines[0] ?? "", /^┌/);
  assert.match(lines.at(-1) ?? "", /^└/);
});

test("single-line tool call defaults to a complete box before live frame sync", () => {
  const lines = createToolCall("live-tool-before-sync").render(40).map(stripAnsi);

  assert.match(lines[0] ?? "", /^┌/);
  assert.match(lines.at(-1) ?? "", /^└/);
});

test("single-line tool call honors thinking bridge before live frame sync", () => {
  bridgeThinkingToToolCalls(["live-tool-before-sync"]);
  const lines = createToolCall("live-tool-before-sync").render(40).map(stripAnsi);

  assert.doesNotMatch(lines[0] ?? "", /^┌/);
  assert.match(lines.at(-1) ?? "", /^└/);
});

test("single-line tool call omits borders when it is between thinking and another tool", () => {
  syncToolCallFrameState([
    { type: "thinking", thinking: "Plan" },
    { type: "toolCall", id: "tool-1", name: "read" },
    { type: "toolCall", id: "tool-2", name: "grep" },
  ]);
  const lines = createToolCall("tool-1").render(40).map(stripAnsi);

  assert.doesNotMatch(lines[0] ?? "", /^┌/);
  assert.doesNotMatch(lines.at(-1) ?? "", /^└/);
});

test("single-line tool call refreshes cache when frame state changes", () => {
  const toolCall = createToolCall("tool-1");
  syncToolCallFrameState([{ type: "toolCall", id: "tool-1", name: "read" }]);
  const first = toolCall.render(40).map(stripAnsi);

  syncToolCallFrameState([
    { type: "thinking", thinking: "Plan" },
    { type: "toolCall", id: "tool-1", name: "read" },
    { type: "toolCall", id: "tool-2", name: "grep" },
  ]);
  const second = toolCall.render(40).map(stripAnsi);

  assert.match(first[0] ?? "", /^┌/);
  assert.match(first.at(-1) ?? "", /^└/);
  assert.doesNotMatch(second[0] ?? "", /^┌/);
  assert.doesNotMatch(second.at(-1) ?? "", /^└/);
});

test("single-line tool call closes the shared box when it is last", () => {
  syncToolCallFrameState([
    { type: "thinking", thinking: "Plan" },
    { type: "toolCall", id: "tool-1", name: "read" },
  ]);
  const lines = createToolCall("tool-1").render(40).map(stripAnsi);

  assert.doesNotMatch(lines[0] ?? "", /^┌/);
  assert.match(lines.at(-1) ?? "", /^└/);
});

test("single-line tool call closes its group before another thinking block", () => {
  syncToolCallFrameState([
    { type: "thinking", thinking: "Plan" },
    { type: "toolCall", id: "tool-1", name: "read" },
    { type: "thinking", thinking: "Review" },
  ]);
  const lines = createToolCall("tool-1").render(40).map(stripAnsi);

  assert.doesNotMatch(lines[0] ?? "", /^┌/);
  assert.match(lines.at(-1) ?? "", /^└/);
});
