import { telegramRpcSessions } from "./telegramRpcSessions.js";
import type { TelegramRpcSession } from "./types.js";

/**
 * Reads the active Telegram RPC session for one chat.
 *
 * @param chatId Telegram chat id.
 * @returns Active session when present.
 */
export function getTelegramRpcSession(chatId: number): TelegramRpcSession | undefined {
  return telegramRpcSessions.get(chatId);
}
