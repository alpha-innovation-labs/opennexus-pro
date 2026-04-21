import { formatTelegramHtml } from "../format/index.js";
import { callTelegramApi } from "./callTelegramApi.js";

/**
 * Sends a text message to a Telegram chat.
 *
 * @param token Telegram bot token.
 * @param chatId Target Telegram chat id.
 * @param text Message text to send.
 * @returns A promise that resolves after Telegram accepts the message.
 */
export async function sendTelegramMessage(token: string, chatId: number, text: string): Promise<void> {
  await callTelegramApi(token, "sendMessage", {
    chat_id: chatId,
    text: formatTelegramHtml(text),
    parse_mode: "HTML",
  });
}
