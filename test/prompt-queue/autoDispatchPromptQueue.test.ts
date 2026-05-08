import assert from "node:assert/strict";
import test from "node:test";
import { PromptQueueController } from "../../packages/extensions/src/prompt-queue/PromptQueueController.js";
import { schedulePromptQueueDispatch } from "../../packages/extensions/src/prompt-queue/schedulePromptQueueDispatch.js";

test("prompt queue auto-dispatch waits for grace and then removes after sending", () => {
  const queue = new PromptQueueController();
  queue.enqueue("next prompt");
  const sent: string[] = [];
  const timers: Array<() => void> = [];

  assert.equal(schedulePromptQueueDispatch(queue, (text) => sent.push(text), () => undefined, (callback) => {
    timers.push(callback);
    return 1;
  }), true);
  assert.equal(queue.isDispatchPending(), true);
  assert.equal(queue.getItems().length, 1);

  timers[0]?.();

  assert.deepEqual(sent, ["next prompt"]);
  assert.equal(queue.isDispatchPending(), false);
  assert.deepEqual(queue.getItems(), []);
});

test("prompt queue auto-dispatch can be canceled before grace expires", () => {
  const queue = new PromptQueueController();
  queue.enqueue("next prompt");
  const sent: string[] = [];
  const timers: Array<() => void> = [];

  schedulePromptQueueDispatch(queue, (text) => sent.push(text), () => undefined, (callback) => {
    timers.push(callback);
    return 1;
  });
  queue.cancelPendingDispatch();
  timers[0]?.();

  assert.deepEqual(sent, []);
  assert.equal(queue.getItems().length, 1);
});

test("prompt queue auto-dispatch keeps item when send throws", () => {
  const queue = new PromptQueueController();
  queue.enqueue("next prompt");
  const timers: Array<() => void> = [];

  schedulePromptQueueDispatch(queue, () => { throw new Error("send failed"); }, () => undefined, (callback) => {
    timers.push(callback);
    return 1;
  });
  timers[0]?.();

  assert.equal(queue.isDispatchPending(), false);
  assert.equal(queue.getItems()[0]?.text, "next prompt");
});

test("prompt queue auto-dispatch waits until runtime is idle", () => {
  const queue = new PromptQueueController();
  queue.enqueue("next prompt");
  const sent: string[] = [];
  const timers: Array<() => void> = [];
  let idle = false;

  schedulePromptQueueDispatch(queue, (text) => sent.push(text), () => undefined, (callback) => {
    timers.push(callback);
    return 1;
  }, () => idle);
  timers[0]?.();
  assert.deepEqual(sent, []);
  assert.equal(queue.getItems().length, 1);

  idle = true;
  timers[1]?.();

  assert.deepEqual(sent, ["next prompt"]);
  assert.deepEqual(queue.getItems(), []);
});
