import assert from "node:assert/strict";
import test from "node:test";
import { shouldShowToolCallBottomBorder } from "../../../packages/extension-core/src/tron/activity/shouldShowToolCallBottomBorder.js";
import { shouldShowToolCallTopBorder } from "../../../packages/extension-core/src/tron/activity/shouldShowToolCallTopBorder.js";
import { syncToolCallFrameState } from "../../../packages/extension-core/src/tron/activity/syncToolCallFrameState.js";
import { resetThinkingToolBridge } from "../../../packages/extension-core/src/tron/activity/resetThinkingToolBridge.js";

test.afterEach(() => {
  resetThinkingToolBridge();
});

test("tool call gets top and bottom borders when it is the only visible activity", () => {
  syncToolCallFrameState([{ type: "toolCall", id: "tool-1", name: "read" }]);

  assert.equal(shouldShowToolCallTopBorder("tool-1"), true);
  assert.equal(shouldShowToolCallBottomBorder("tool-1"), true);
});

test("tool calls after thinking share the thinking box and only the last tool closes it", () => {
  syncToolCallFrameState([
    { type: "thinking", thinking: "Plan" },
    { type: "toolCall", id: "tool-1", name: "read" },
    { type: "toolCall", id: "tool-2", name: "grep" },
  ]);

  assert.equal(shouldShowToolCallTopBorder("tool-1"), false);
  assert.equal(shouldShowToolCallBottomBorder("tool-1"), false);
  assert.equal(shouldShowToolCallTopBorder("tool-2"), false);
  assert.equal(shouldShowToolCallBottomBorder("tool-2"), true);
});

test("tool call closes its group when followed by another thinking block", () => {
  syncToolCallFrameState([
    { type: "thinking", thinking: "Plan" },
    { type: "toolCall", id: "tool-1", name: "read" },
    { type: "thinking", thinking: "Review" },
  ]);

  assert.equal(shouldShowToolCallBottomBorder("tool-1"), true);
});

test("frame state connects tool-only assistant followups to prior tool groups", () => {
  syncToolCallFrameState([
    { type: "thinking", thinking: "Plan" },
    { type: "toolCall", id: "first-answer-tool", name: "find" },
  ]);
  syncToolCallFrameState([
    { type: "toolCall", id: "second-answer-tool", name: "read" },
    { type: "toolCall", id: "third-answer-tool", name: "read" },
  ]);

  assert.equal(shouldShowToolCallTopBorder("first-answer-tool"), false);
  assert.equal(shouldShowToolCallBottomBorder("first-answer-tool"), false);
  assert.equal(shouldShowToolCallTopBorder("second-answer-tool"), false);
  assert.equal(shouldShowToolCallBottomBorder("second-answer-tool"), false);
  assert.equal(shouldShowToolCallTopBorder("third-answer-tool"), false);
  assert.equal(shouldShowToolCallBottomBorder("third-answer-tool"), true);
});
