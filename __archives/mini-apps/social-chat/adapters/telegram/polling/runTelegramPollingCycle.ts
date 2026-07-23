import { chunkTelegramMessageText } from "../runtime/chunkTelegramMessageText.js";
import { runTelegramTurnWithLiveStatus } from "../runtime/runTelegramTurnWithLiveStatus.js";
import { toTelegramInboundMessage } from "../runtime/toTelegramInboundMessage.js";
import type { TelegramPollingConfig, TelegramPollingDependencies } from "./types.js";

/**
 * Processes one Telegram polling batch.
 *
 * @param config Telegram polling config.
 * @param deps Polling dependencies.
 * @returns A promise that resolves after the batch completes.
 */
export async function runTelegramPollingCycle(
  config: TelegramPollingConfig,
  deps: TelegramPollingDependencies,
): Promise<void> {
  const offset = await deps.readOffset();
  const updates = await deps.getUpdates(offset);
  let nextOffset = offset;

  for (const update of updates) {
    nextOffset = Math.max(nextOffset, update.update_id + 1);

    try {
      const inboundMessage = toTelegramInboundMessage(update, config.allowedUserIds);
      if (!inboundMessage) {
        continue;
      }

      console.log("[social-chat:telegram:received]", {
        chatId: inboundMessage.chatId,
        messageId: inboundMessage.messageId,
        userId: inboundMessage.userId,
        userName: inboundMessage.userName,
        text: inboundMessage.text,
      });

      const reply = await runTelegramTurnWithLiveStatus(inboundMessage, {
        editStatusMessage: deps.editStatusMessage,
        runAgentTurn: deps.runAgentTurn,
        sendStatusMessage: deps.sendStatusMessage,
        sendTyping: deps.sendTyping,
      });
      for (const chunk of chunkTelegramMessageText(reply)) {
        await deps.sendMessage(inboundMessage.chatId, chunk);
      }
    } catch (error) {
      console.error("[social-chat:telegram]", error);
    } finally {
      await deps.writeOffset(nextOffset);
    }
  }
}
