import { clearTelegramRpcSession } from "./clearTelegramRpcSession.js";
import type { TelegramRpcSession } from "./types.js";

/**
 * Drops a stuck Telegram RPC session and terminates its child process.
 *
 * @param session Session to reset.
 */
export function resetTelegramRpcSession(session: TelegramRpcSession): void {
  const currentRequest = session.currentRequest;
  if (currentRequest) {
    clearTimeout(currentRequest.timeout);
    session.currentRequest = undefined;
  }

  clearTelegramRpcSession(session.chatId, session);

  if (session.child.exitCode === null && !session.child.killed) {
    session.child.kill("SIGTERM");
  }
}
