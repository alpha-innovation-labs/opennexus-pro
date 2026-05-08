import assert from "node:assert/strict";
import test from "node:test";
import { shouldBypassPromptQueueEnter } from "../../../packages/extensions/src/prompt-queue/shouldBypassPromptQueueEnter.js";

test("prompt queue bypasses enter when trigger modal is active", () => {
  assert.equal(shouldBypassPromptQueueEnter("\r", false, true), true);
});

test("prompt queue bypasses enter when autocomplete is active", () => {
  assert.equal(shouldBypassPromptQueueEnter("\r", true, false), true);
});

test("prompt queue owns enter when no modal or autocomplete is active", () => {
  assert.equal(shouldBypassPromptQueueEnter("\r", false, false), false);
});

test("prompt queue does not bypass non-enter input", () => {
  assert.equal(shouldBypassPromptQueueEnter("a", true, true), false);
});
