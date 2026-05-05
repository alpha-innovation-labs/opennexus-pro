import assert from "node:assert/strict";
import test from "node:test";
import { runTelegramPollingCycle } from "../../../packages/social-adapters/src/telegram/polling/runTelegramPollingCycle.js";

test("runTelegramPollingCycle advances the offset and replies to allowed users", async () => {
  const sent: Array<{ chatId: number; text: string }> = [];
  const edited: string[] = [];
  let storedOffset = 0;

  await runTelegramPollingCycle(
    {
      allowedUserIds: new Set(["42"]),
    },
    {
      editStatusMessage: async (_chatId, _messageId, text) => {
        edited.push(text);
      },
      getUpdates: async () => [
        {
          update_id: 4,
          message: {
            message_id: 1,
            text: "hello",
            chat: { id: 11, type: "private" },
            from: { id: 42, is_bot: false, first_name: "Ada" },
          },
        },
        {
          update_id: 5,
          message: {
            message_id: 2,
            text: "ignore me",
            chat: { id: 12, type: "private" },
            from: { id: 77, is_bot: false, first_name: "Bob" },
          },
        },
      ],
      readOffset: async () => storedOffset,
      runAgentTurn: async (message, onEvent) => {
        onEvent?.({ type: "agent_start" });
        onEvent?.({ type: "tool_execution_start", toolName: "read", args: { path: "src/index.ts" } });
        onEvent?.({ type: "tool_execution_end", toolName: "read", isError: false });
        return `reply:${message.text}`;
      },
      sendMessage: async (chatId, text) => {
        sent.push({ chatId, text });
      },
      sendStatusMessage: async () => 99,
      sendTyping: async () => undefined,
      writeOffset: async (offset) => {
        storedOffset = offset;
      },
    },
  );

  assert.deepEqual(sent, [{ chatId: 11, text: "reply:hello" }]);
  assert.ok(edited.some((text) => text.includes("Thinking")));
  assert.equal(storedOffset, 6);
});

test("runTelegramPollingCycle persists each update offset and continues after errors", async () => {
  const sent: Array<{ chatId: number; text: string }> = [];
  const storedOffsets: number[] = [];
  let storedOffset = 0;
  const originalConsoleError = console.error;
  console.error = (() => undefined) as typeof console.error;

  try {
    await runTelegramPollingCycle(
      {
        allowedUserIds: new Set(["42"]),
      },
      {
        editStatusMessage: async () => undefined,
        getUpdates: async () => [
          {
            update_id: 10,
            message: {
              message_id: 1,
              text: "first",
              chat: { id: 11, type: "private" },
              from: { id: 42, is_bot: false, first_name: "Ada" },
            },
          },
          {
            update_id: 11,
            message: {
              message_id: 2,
              text: "second",
              chat: { id: 11, type: "private" },
              from: { id: 42, is_bot: false, first_name: "Ada" },
            },
          },
        ],
        readOffset: async () => storedOffset,
        runAgentTurn: async (message) => {
          if (message.text === "first") {
            throw new Error("boom");
          }
          return `reply:${message.text}`;
        },
        sendMessage: async (chatId, text) => {
          sent.push({ chatId, text });
        },
        sendStatusMessage: async () => 100,
        sendTyping: async () => undefined,
        writeOffset: async (offset) => {
          storedOffset = offset;
          storedOffsets.push(offset);
        },
      },
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.deepEqual(sent, [{ chatId: 11, text: "reply:second" }]);
  assert.deepEqual(storedOffsets, [11, 12]);
  assert.equal(storedOffset, 12);
});
