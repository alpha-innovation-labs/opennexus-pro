import { callTelegramApi } from "./callTelegramApi.js";
import type { TelegramUpdate } from "../runtime/types.js";

/**
 * Fetches Telegram updates after the current offset.
 *
 * @param token Telegram bot token.
 * @param offset Next Telegram update offset.
 * @returns Telegram updates for processing.
 */
export async function getTelegramUpdates(token: string, offset: number): Promise<TelegramUpdate[]> {
  return callTelegramApi<TelegramUpdate[]>(token, "getUpdates", {
    allowed_updates: ["message"],
    offset,
    timeout: 30,
  });
}
