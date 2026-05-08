import assert from "node:assert/strict";
import test from "node:test";
import { shouldQueuePromptOnEnter } from "../../../packages/extensions/src/prompt-queue/shouldQueuePromptOnEnter.js";

test("enter sends immediately while the assistant is idle", () => {
  assert.equal(shouldQueuePromptOnEnter(true), false);
});

test("enter queues while the assistant is working", () => {
  assert.equal(shouldQueuePromptOnEnter(false), true);
});
