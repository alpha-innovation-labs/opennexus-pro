import assert from "node:assert/strict";
import test from "node:test";
import { toTelegramInboundMessage } from "../../../packages/mini-apps/src/social-chat/adapters/telegram/runtime/toTelegramInboundMessage.js";

test("toTelegramInboundMessage keeps allowed text messages", () => {
  const message = toTelegramInboundMessage(
    {
      update_id: 10,
      message: {
        message_id: 7,
        text: "hello",
        chat: { id: 99, type: "private" },
        from: { id: 42, is_bot: false, first_name: "Ada" },
      },
    },
    new Set(["42"]),
  );

  assert.deepEqual(message, {
    chatId: 99,
    messageId: 7,
    text: "hello",
    userId: "42",
    userName: "Ada",
  });
});

test("toTelegramInboundMessage rejects unauthorized users and non-text updates", () => {
  assert.equal(
    toTelegramInboundMessage(
      {
        update_id: 11,
        message: {
          message_id: 8,
          chat: { id: 100, type: "private" },
          from: { id: 77, is_bot: false, first_name: "Bob" },
        },
      },
      new Set(["42"]),
    ),
    undefined,
  );

  assert.equal(
    toTelegramInboundMessage(
      {
        update_id: 12,
        message: {
          message_id: 9,
          text: "hello",
          chat: { id: 100, type: "private" },
          from: { id: 77, is_bot: false, first_name: "Bob" },
        },
      },
      new Set(["42"]),
    ),
    undefined,
  );
});
