import { attachTelegramRpcProcessListeners } from "./attachTelegramRpcProcessListeners.js";
import { createTelegramRpcProcess } from "./createTelegramRpcProcess.js";
import { getTelegramRpcSession } from "./getTelegramRpcSession.js";
import { setTelegramRpcSession } from "./setTelegramRpcSession.js";
import type { TelegramRpcSession } from "./types.js";

/**
 * Gets or creates the persistent RPC session for a Telegram chat.
 *
 * @param chatId Telegram chat id.
 * @returns Active Telegram RPC session.
 */
export function ensureTelegramRpcSession(chatId: number): TelegramRpcSession {
  const existingSession = getTelegramRpcSession(chatId);
  if (existingSession && existingSession.child.exitCode === null && !existingSession.child.killed) {
    return existingSession;
  }

  const session = createTelegramRpcProcess(chatId);
  attachTelegramRpcProcessListeners(session);
  setTelegramRpcSession(chatId, session);
  return session;
}
