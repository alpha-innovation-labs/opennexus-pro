import assert from "node:assert/strict";
import test from "node:test";
import { renderPromptQueue } from "../../packages/extensions/src/prompt-queue/renderPromptQueue.js";
import { createTestTheme } from "../support/theme/createTestTheme.js";
import type { PromptQueueItem } from "../../packages/extensions/src/prompt-queue/types.js";

function item(index: number, text = `queued item ${index}`): PromptQueueItem {
  return { id: `item-${index}`, text, createdAt: index };
}

test("prompt queue render keeps selected row visible when list scrolls", () => {
  const items = Array.from({ length: 8 }, (_, index) => item(index));
  const output = renderPromptQueue(120, items, "item-7", true, createTestTheme(), true).join("\n");

  assert.match(output, /queued item 7/u);
  assert.doesNotMatch(output, /queued item 0/u);
});

test("prompt queue render preserves multiline context as first line plus count", () => {
  const output = renderPromptQueue(120, [item(1, "first line\nsecond line\nthird line")], "item-1", false, createTestTheme(), true).join("\n");

  assert.match(output, /first line ↵ 3 lines/u);
});

test("prompt queue render shows edit mode enter and alt-enter semantics", () => {
  const output = renderPromptQueue(120, [item(1)], "item-1", false, createTestTheme(), true, true).join("\n");

  assert.match(output, /Enter save edit/u);
  assert.match(output, /Alt\+Enter send now/u);
});
