import { clearTelegramRpcSession } from "./clearTelegramRpcSession.js";
import { createJsonLineParser } from "./createJsonLineParser.js";
import { handleTelegramRpcEvent } from "./handleTelegramRpcEvent.js";
import type { TelegramRpcSession } from "./types.js";

/**
 * Attaches stdout and lifecycle listeners to a Telegram RPC child.
 *
 * @param session Active Telegram RPC session.
 */
export function attachTelegramRpcProcessListeners(session: TelegramRpcSession): void {
  const parser = createJsonLineParser((value) => {
    handleTelegramRpcEvent(session, value);
  });

  session.child.stdout.on("data", (chunk) => {
    parser.push(String(chunk));
  });
  session.child.stderr.on("data", (chunk) => {
    session.stderr += String(chunk);
  });
  session.child.on("exit", () => {
    const currentRequest = session.currentRequest;
    if (currentRequest) {
      clearTimeout(currentRequest.timeout);
      session.currentRequest = undefined;
      currentRequest.reject(new Error(session.stderr.trim() || "Telegram RPC child exited unexpectedly"));
    }
    clearTelegramRpcSession(session.chatId, session);
  });
}
