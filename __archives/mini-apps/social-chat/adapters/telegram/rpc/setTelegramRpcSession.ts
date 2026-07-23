import { telegramRpcSessions } from "./telegramRpcSessions.js";
import type { TelegramRpcSession } from "./types.js";

/**
 * Stores the active Telegram RPC session for one chat.
 *
 * @param chatId Telegram chat id.
 * @param session Active session instance.
 */
export function setTelegramRpcSession(chatId: number, session: TelegramRpcSession): void {
  telegramRpcSessions.set(chatId, session);
}
