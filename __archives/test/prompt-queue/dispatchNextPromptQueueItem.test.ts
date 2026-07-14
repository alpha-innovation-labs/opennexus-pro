import assert from "node:assert/strict";
import test from "node:test";
import { PromptQueueController } from "../../packages/extension-core/src/prompt-queue/PromptQueueController.js";
import { dispatchNextPromptQueueItem } from "../../packages/extension-core/src/prompt-queue/dispatchNextPromptQueueItem.js";

test("prompt queue dispatches and removes the next item after a turn", () => {
  const persistedLengths: number[] = [];
  const queue = new PromptQueueController((items) => persistedLengths.push(items.length));
  queue.enqueue("and then do a grep");
  const sent: string[] = [];

  const dispatched = dispatchNextPromptQueueItem(queue, (text) => sent.push(text));

  assert.equal(dispatched, true);
  assert.deepEqual(sent, ["and then do a grep"]);
  assert.deepEqual(queue.getItems(), []);
  assert.deepEqual(persistedLengths, [1, 0]);
});

test("prompt queue dispatch is a no-op when the queue is empty", () => {
  const queue = new PromptQueueController();
  const sent: string[] = [];

  const dispatched = dispatchNextPromptQueueItem(queue, (text) => sent.push(text));

  assert.equal(dispatched, false);
  assert.deepEqual(sent, []);
});
