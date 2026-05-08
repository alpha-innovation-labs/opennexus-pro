import assert from "node:assert/strict";
import test from "node:test";
import { PromptQueueController } from "../../../packages/extensions/src/prompt-queue/PromptQueueController.js";

test("prompt queue appends non-empty messages and ignores empty messages", () => {
  const persisted: unknown[] = [];
  const controller = new PromptQueueController((items) => persisted.push(items));

  assert.equal(controller.enqueue("  first  ")?.text, "first");
  assert.equal(controller.enqueue("   "), undefined);

  assert.equal(controller.getItems().length, 1);
  assert.equal(persisted.length, 1);
});

test("prompt queue replaces edited messages instead of appending duplicates", () => {
  const controller = new PromptQueueController();
  const item = controller.enqueue("original");

  controller.update(item?.id ?? "", "edited");

  assert.deepEqual(controller.getItems().map((entry) => entry.text), ["edited"]);
});

test("prompt queue removes edited messages that become empty", () => {
  const controller = new PromptQueueController();
  const item = controller.enqueue("original");

  controller.update(item?.id ?? "", "   ");

  assert.equal(controller.getItems().length, 0);
});

test("prompt queue navigation focuses, moves, and removes selected items", () => {
  const controller = new PromptQueueController();
  const first = controller.enqueue("first");
  const second = controller.enqueue("second");

  controller.toggleFocus();
  assert.equal(controller.isFocused(), true);
  assert.equal(controller.getSelected()?.id, first?.id);

  controller.move(1);
  assert.equal(controller.getSelected()?.id, second?.id);

  controller.remove(second?.id ?? "");
  assert.equal(controller.getSelected()?.id, first?.id);
});
