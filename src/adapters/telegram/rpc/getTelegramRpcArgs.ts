import { getTelegramChatSessionDir } from "../session/getTelegramChatSessionDir.js";

/**
 * Creates the Nexus RPC argv for a Telegram chat.
 *
 * @param chatId Telegram chat id.
 * @returns Nexus child argv.
 */
export function getTelegramRpcArgs(chatId: number): string[] {
  return ["--mode", "rpc", "--session-dir", getTelegramChatSessionDir(chatId), "--continue"];
}
