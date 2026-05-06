import type { TelegramInboundMessage, TelegramUpdate } from "./types.js";

/**
 * Normalizes a Telegram update into an allowed inbound text message.
 *
 * @param update Telegram update to inspect.
 * @param allowedUserIds Allowed Telegram user ids.
 * @returns Normalized inbound message or undefined.
 */
export function toTelegramInboundMessage(
  update: TelegramUpdate,
  allowedUserIds: Set<string>,
): TelegramInboundMessage | undefined {
  const message = update.message;
  const userId = message?.from?.id ? String(message.from.id) : undefined;
  const text = message?.text?.trim();

  if (!message || !userId || !text || !allowedUserIds.has(userId)) {
    return undefined;
  }

  return {
    chatId: message.chat.id,
    messageId: message.message_id,
    text,
    userId,
    userName: message.from?.username ?? message.from?.first_name,
  };
}
