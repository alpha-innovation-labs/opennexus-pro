import { attachTelegramRpcProcessListeners } from "./attachTelegramRpcProcessListeners.js";
import { createTelegramRpcProcess } from "./createTelegramRpcProcess.js";
import type { TelegramRpcSession } from "./types.js";

const telegramRpcSessions = new Map<number, TelegramRpcSession>();

/**
 * Gets or creates the persistent RPC session for a Telegram chat.
 *
 * @param chatId Telegram chat id.
 * @returns Active Telegram RPC session.
 */
export function ensureTelegramRpcSession(chatId: number): TelegramRpcSession {
  const existingSession = telegramRpcSessions.get(chatId);
  if (existingSession && existingSession.child.exitCode === null && !existingSession.child.killed) {
    return existingSession;
  }

  const session = createTelegramRpcProcess(chatId);
  attachTelegramRpcProcessListeners(session, (closedChatId) => {
    telegramRpcSessions.delete(closedChatId);
  });
  telegramRpcSessions.set(chatId, session);
  return session;
}
