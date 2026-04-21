import { ensureTelegramRpcSession } from "./ensureTelegramRpcSession.js";
import { sendTelegramRpcPrompt } from "./sendTelegramRpcPrompt.js";

/**
 * Runs a Telegram chat turn through a persistent Nexus RPC session.
 *
 * @param chatId Telegram chat id.
 * @param text User message text.
 * @param onEvent Optional callback for streamed RPC events.
 * @returns Final assistant reply text.
 */
export async function runTelegramRpcTurn(
  chatId: number,
  text: string,
  onEvent?: (event: unknown) => void,
): Promise<string> {
  const session = ensureTelegramRpcSession(chatId);
  const run = session.queue.then(() => sendTelegramRpcPrompt(session, text, onEvent));
  session.queue = run.catch(() => undefined);
  return run;
}
