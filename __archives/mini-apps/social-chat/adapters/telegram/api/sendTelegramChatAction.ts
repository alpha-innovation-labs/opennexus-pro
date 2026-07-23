import { callTelegramApi } from "./callTelegramApi.js";

/**
 * Sends a Telegram chat action such as typing.
 *
 * @param token Telegram bot token.
 * @param chatId Target Telegram chat id.
 * @param action Telegram chat action.
 * @returns A promise that resolves after Telegram accepts the action.
 */
export async function sendTelegramChatAction(token: string, chatId: number, action: "typing"): Promise<void> {
  await callTelegramApi(token, "sendChatAction", {
    chat_id: chatId,
    action,
  });
}
