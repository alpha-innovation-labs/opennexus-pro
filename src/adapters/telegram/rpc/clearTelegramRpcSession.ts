import { telegramRpcSessions } from "./telegramRpcSessions.js";
import type { TelegramRpcSession } from "./types.js";

/**
 * Removes the active Telegram RPC session when it still matches the expected instance.
 *
 * @param chatId Telegram chat id.
 * @param session Expected active session. Omit to clear unconditionally.
 */
export function clearTelegramRpcSession(chatId: number, session?: TelegramRpcSession): void {
  if (!session) {
    telegramRpcSessions.delete(chatId);
    return;
  }

  if (telegramRpcSessions.get(chatId) === session) {
    telegramRpcSessions.delete(chatId);
  }
}
