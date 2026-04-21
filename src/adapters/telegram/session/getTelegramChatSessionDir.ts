import { join } from "node:path";
import { getGatewayRootPath } from "../../../gateway/paths/getGatewayRootPath.js";

/**
 * Resolves the Nexus session directory for a Telegram chat.
 *
 * @param chatId Telegram chat id.
 * @returns Absolute chat session directory.
 */
export function getTelegramChatSessionDir(chatId: number): string {
  return join(getGatewayRootPath(), "telegram-chats", String(chatId));
}
