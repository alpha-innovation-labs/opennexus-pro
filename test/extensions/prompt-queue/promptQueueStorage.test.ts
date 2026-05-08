import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { readPromptQueueItems } from "../../../packages/extensions/src/prompt-queue/readPromptQueueItems.js";
import { writePromptQueueItems } from "../../../packages/extensions/src/prompt-queue/writePromptQueueItems.js";

test("prompt queue storage writes and reads valid persisted items", async () => {
  const dir = await mkdtemp(join(tmpdir(), "nexus-prompt-queue-"));
  const filePath = join(dir, "queue", "messages.json");
  try {
    await writePromptQueueItems(filePath, [{ id: "a", text: "hello", createdAt: 1 }]);
    assert.deepEqual(await readPromptQueueItems(filePath), [{ id: "a", text: "hello", createdAt: 1 }]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("prompt queue storage returns empty queue for missing files", async () => {
  assert.deepEqual(await readPromptQueueItems(join(tmpdir(), "missing-nexus-queue.json")), []);
});
