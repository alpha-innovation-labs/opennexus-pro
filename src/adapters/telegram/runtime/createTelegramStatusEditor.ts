const TELEGRAM_STATUS_EDIT_INTERVAL_MS = 1200;

/**
 * Creates a throttled Telegram status editor.
 *
 * @param chatId Target Telegram chat id.
 * @param messageId Telegram status message id.
 * @param editMessage Performs the Telegram edit.
 * @returns Throttled update function.
 */
export function createTelegramStatusEditor(
  chatId: number,
  messageId: number,
  editMessage: (chatId: number, messageId: number, text: string) => Promise<void>,
): (text: string) => Promise<void> {
  let lastText = "";
  let lastEditAt = 0;

  return async (text: string): Promise<void> => {
    if (!text || text === lastText) {
      return;
    }

    const now = Date.now();
    if (now - lastEditAt < TELEGRAM_STATUS_EDIT_INTERVAL_MS) {
      return;
    }

    try {
      await editMessage(chatId, messageId, text);
      lastText = text;
      lastEditAt = now;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("message is not modified")) {
        lastText = text;
        lastEditAt = now;
        return;
      }

      console.error("[gateway:telegram:status-edit]", {
        chatId,
        messageId,
        message,
      });
    }
  };
}
