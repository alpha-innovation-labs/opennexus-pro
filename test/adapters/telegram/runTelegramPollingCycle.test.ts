import assert from "node:assert/strict";
import test from "node:test";
import { runTelegramPollingCycle } from "../../../src/adapters/telegram/polling/runTelegramPollingCycle.js";

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
  assert.ok(edited.some((text) => text.includes('path="src/index.ts"')));
  assert.equal(storedOffset, 6);
});
