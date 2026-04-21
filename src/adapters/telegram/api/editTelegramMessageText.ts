import { formatTelegramHtml } from "../format/index.js";
import { callTelegramApi } from "./callTelegramApi.js";

/**
 * Rewrites the text of an existing Telegram message.
 *
 * @param token Telegram bot token.
 * @param chatId Target Telegram chat id.
 * @param messageId Telegram message id.
 * @param text Message text to send.
 * @returns A promise that resolves after Telegram accepts the update.
 */
export async function editTelegramMessageText(token: string, chatId: number, messageId: number, text: string): Promise<void> {
  await callTelegramApi(token, "editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text: formatTelegramHtml(text),
    parse_mode: "HTML",
  });
}
