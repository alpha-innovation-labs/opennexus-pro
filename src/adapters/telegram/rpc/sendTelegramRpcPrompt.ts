import { createTelegramRpcRequestId } from "./createTelegramRpcRequestId.js";
import type { TelegramRpcSession } from "./types.js";

const TELEGRAM_RPC_PROMPT_TIMEOUT_MS = 120000;

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
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const requestId = createTelegramRpcRequestId(session.chatId);
    const timeout = setTimeout(() => {
      if (session.currentRequest?.requestId === requestId) {
        session.currentRequest = undefined;
        reject(new Error("Telegram RPC prompt timed out"));
      }
    }, TELEGRAM_RPC_PROMPT_TIMEOUT_MS);

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
