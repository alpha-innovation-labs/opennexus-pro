import { createTelegramRpcRequestId } from "./createTelegramRpcRequestId.js";
import { resetTelegramRpcSession } from "./resetTelegramRpcSession.js";
import type { TelegramRpcSession } from "./types.js";

const TELEGRAM_RPC_PROMPT_TIMEOUT_MS = 120000;

export interface TelegramRpcPromptDependencies {
  resetSession(session: TelegramRpcSession): void;
  timeoutMs: number;
}

/**
 * Sends a prompt to a persistent Telegram RPC session.
 *
 * @param session Active Telegram RPC session.
 * @param text User message text.
 * @param onEvent Optional callback for streamed RPC events.
 * @returns Final assistant reply text.
 */
export async function sendTelegramRpcPrompt(
  session: TelegramRpcSession,
  text: string,
  onEvent?: (event: unknown) => void,
  deps: TelegramRpcPromptDependencies = {
    resetSession: resetTelegramRpcSession,
    timeoutMs: TELEGRAM_RPC_PROMPT_TIMEOUT_MS,
  },
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const requestId = createTelegramRpcRequestId(session.chatId);
    const timeout = setTimeout(() => {
      if (session.currentRequest?.requestId !== requestId) {
        return;
      }

      const error = new Error("Telegram RPC prompt timed out");
      deps.resetSession(session);
      reject(error);
    }, deps.timeoutMs);

    session.currentRequest = {
      requestId,
      resolve,
      reject,
      timeout,
      onEvent,
    };
    session.child.stdin.write(`${JSON.stringify({ id: requestId, type: "prompt", message: text })}\n`);
  });
}
