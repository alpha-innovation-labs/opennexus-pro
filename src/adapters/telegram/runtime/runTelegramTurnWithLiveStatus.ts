import { applyTelegramLiveStatusEvent } from "../live-status/applyTelegramLiveStatusEvent.js";
import { createInitialTelegramLiveStatusText } from "../live-status/createInitialTelegramLiveStatusText.js";
import { createTelegramLiveStatusState } from "../live-status/createTelegramLiveStatusState.js";
import { renderTelegramLiveStatus } from "../live-status/renderTelegramLiveStatus.js";
import type { TelegramInboundMessage } from "./types.js";
import { createTelegramStatusEditor } from "./createTelegramStatusEditor.js";
import { startTelegramTypingLoop } from "./startTelegramTypingLoop.js";

export interface TelegramTurnDependencies {
  editStatusMessage(chatId: number, messageId: number, text: string): Promise<void>;
  runAgentTurn(message: TelegramInboundMessage, onEvent?: (event: unknown) => void): Promise<string>;
  sendStatusMessage(chatId: number, text: string): Promise<number>;
  sendTyping(chatId: number): Promise<void>;
}

/**
 * Runs one Telegram turn with typing and a rewritten live-status message.
 *
 * @param message Telegram inbound message.
 * @param deps Telegram turn dependencies.
 * @returns Final assistant reply text.
 */
export async function runTelegramTurnWithLiveStatus(
  message: TelegramInboundMessage,
  deps: TelegramTurnDependencies,
): Promise<string> {
  const statusMessageId = await deps.sendStatusMessage(message.chatId, createInitialTelegramLiveStatusText());
  const stopTyping = startTelegramTypingLoop(message.chatId, deps.sendTyping);
  const state = createTelegramLiveStatusState();
  const editStatus = createTelegramStatusEditor(message.chatId, statusMessageId, deps.editStatusMessage);

  try {
    const reply = await deps.runAgentTurn(message, (event) => {
      applyTelegramLiveStatusEvent(state, event);
      void editStatus(renderTelegramLiveStatus(state));
    });
    stopTyping();
    return reply;
  } catch (error) {
    stopTyping();
    await editStatus(`**Nexus failed**\n\n${String(error instanceof Error ? error.message : error)}`);
    throw error;
  }
}
