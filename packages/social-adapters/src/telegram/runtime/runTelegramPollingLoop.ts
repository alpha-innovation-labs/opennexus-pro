import { editTelegramMessageText } from "../api/editTelegramMessageText.js";
import { getTelegramUpdates } from "../api/getTelegramUpdates.js";
import { sendTelegramChatAction } from "../api/sendTelegramChatAction.js";
import { sendTelegramMessage } from "../api/sendTelegramMessage.js";
import { sendTelegramStatusMessage } from "../api/sendTelegramStatusMessage.js";
import { readTelegramAllowedUserIds } from "../config/readTelegramAllowedUserIds.js";
import { readTelegramBotToken } from "../config/readTelegramBotToken.js";
import { readTelegramPollIntervalMs } from "../config/readTelegramPollIntervalMs.js";
import { readTelegramPollOffset } from "../polling/readTelegramPollOffset.js";
import { runTelegramPollingCycle } from "../polling/runTelegramPollingCycle.js";
import { writeTelegramPollOffset } from "../polling/writeTelegramPollOffset.js";
import { runNexusTelegramTurn } from "./runNexusTelegramTurn.js";
import { sleep } from "./sleep.js";

/**
 * Runs the Telegram polling worker until shutdown.
 *
 * @param isStopping Reports whether the gateway is stopping.
 * @returns A promise that resolves when polling stops.
 */
export async function runTelegramPollingLoop(isStopping: () => boolean): Promise<void> {
  const pollIntervalMs = readTelegramPollIntervalMs();
  const token = readTelegramBotToken();
  if (!token) {
    while (!isStopping()) {
      await sleep(pollIntervalMs);
    }
    return;
  }

  const allowedUserIds = readTelegramAllowedUserIds();

  while (!isStopping()) {
    try {
      await runTelegramPollingCycle(
        { allowedUserIds },
        {
          editStatusMessage: async (chatId, messageId, text) => editTelegramMessageText(token, chatId, messageId, text),
          getUpdates: async (offset) => getTelegramUpdates(token, offset),
          readOffset: readTelegramPollOffset,
          runAgentTurn: runNexusTelegramTurn,
          sendMessage: async (chatId, text) => sendTelegramMessage(token, chatId, text),
          sendStatusMessage: async (chatId, text) => sendTelegramStatusMessage(token, chatId, text),
          sendTyping: async (chatId) => sendTelegramChatAction(token, chatId, "typing"),
          writeOffset: writeTelegramPollOffset,
        },
      );
    } catch (error) {
      console.error("[gateway:telegram]", error);
    }

    if (!isStopping()) {
      await sleep(pollIntervalMs);
    }
  }
}
