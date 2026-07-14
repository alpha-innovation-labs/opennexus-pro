import assert from "node:assert/strict";
import test from "node:test";
import { createTelegramStatusEditor } from "../../../packages/mini-apps/src/social-chat/adapters/telegram/runtime/createTelegramStatusEditor.js";

/**
 * Waits long enough for queued timer work to complete.
 *
 * @param ms Delay in milliseconds.
 * @returns A promise that resolves after the delay.
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

test("createTelegramStatusEditor coalesces rapid updates into the latest text", async () => {
  const edits: string[] = [];
  const editStatus = createTelegramStatusEditor(
    1,
    2,
    async (_chatId, _messageId, text) => {
      edits.push(text);
    },
    { intervalMs: 20 },
  );

  await editStatus("one");
  await editStatus("two");
  await editStatus("three");
  await wait(50);

  assert.deepEqual(edits, ["one", "three"]);
});

test("createTelegramStatusEditor backs off and retries after Telegram rate limits", async () => {
  const edits: string[] = [];
  let shouldRateLimit = true;
  const editStatus = createTelegramStatusEditor(
    1,
    2,
    async (_chatId, _messageId, text) => {
      edits.push(text);
      if (shouldRateLimit) {
        shouldRateLimit = false;
        throw new Error("Too Many Requests: retry after 0");
      }
    },
    { intervalMs: 10 },
  );

  await editStatus("alpha");
  await editStatus("beta");
  await wait(40);

  assert.deepEqual(edits, ["alpha", "beta"]);
});
