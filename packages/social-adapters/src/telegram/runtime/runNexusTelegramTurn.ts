import { runTelegramRpcTurn } from "../rpc/runTelegramRpcTurn.js";
import type { TelegramInboundMessage } from "./types.js";

/**
 * Runs a single Nexus turn for a Telegram chat.
 *
 * @param message Telegram inbound message.
 * @param onEvent Optional callback for streamed RPC events.
 * @returns Final assistant reply text.
 */
export async function runNexusTelegramTurn(
  message: TelegramInboundMessage,
  onEvent?: (event: unknown) => void,
): Promise<string> {
  return runTelegramRpcTurn(message.chatId, message.text, onEvent);
}
