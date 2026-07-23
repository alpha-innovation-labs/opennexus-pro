import { formatTelegramHtml } from "../format/index.js";
import { callTelegramApi } from "./callTelegramApi.js";

interface TelegramSentMessage {
  message_id: number;
}

/**
 * Sends a Telegram status message and returns its message id.
 *
 * @param token Telegram bot token.
 * @param chatId Target Telegram chat id.
 * @param text Message text to send.
 * @returns Telegram message id.
 */
export async function sendTelegramStatusMessage(token: string, chatId: number, text: string): Promise<number> {
  const result = await callTelegramApi<TelegramSentMessage>(token, "sendMessage", {
    chat_id: chatId,
    text: formatTelegramHtml(text),
    parse_mode: "HTML",
  });

  return result.message_id;
}
