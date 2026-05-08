import assert from "node:assert/strict";
import test from "node:test";
import { handlePromptQueueInput } from "../../../packages/extensions/src/prompt-queue/handlePromptQueueInput.js";
import { PromptQueueController } from "../../../packages/extensions/src/prompt-queue/PromptQueueController.js";

test("queue focused e loads the selected message for editing", () => {
  const queue = new PromptQueueController();
  const item = queue.enqueue("edit me");
  let loaded: { text: string; itemId: string } | undefined;
  queue.toggleFocus();

  const consumed = handlePromptQueueInput("e", queue, {
    loadText: (text, itemId) => { loaded = { text, itemId }; },
    requestRender: () => undefined,
    sendText: () => undefined,
  });

  assert.equal(consumed, true);
  assert.deepEqual(loaded, { text: "edit me", itemId: item?.id });
  assert.equal(queue.isFocused(), false);
});

test("queue focused dd deletes the selected message", () => {
  const queue = new PromptQueueController();
  queue.enqueue("delete me");
  queue.toggleFocus();

  handlePromptQueueInput("d", queue, {
    loadText: () => undefined,
    requestRender: () => undefined,
    sendText: () => undefined,
  });
  handlePromptQueueInput("d", queue, {
    loadText: () => undefined,
    requestRender: () => undefined,
    sendText: () => undefined,
  });

  assert.equal(queue.getItems().length, 0);
});

test("queue focused enter sends and removes the selected message", () => {
  const queue = new PromptQueueController();
  queue.enqueue("send me");
  const sent: string[] = [];
  queue.toggleFocus();

  handlePromptQueueInput("\r", queue, {
    loadText: () => undefined,
    requestRender: () => undefined,
    sendText: (text) => sent.push(text),
  });

  assert.deepEqual(sent, ["send me"]);
  assert.equal(queue.getItems().length, 0);
});
