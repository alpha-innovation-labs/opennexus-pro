const TELEGRAM_TYPING_INTERVAL_MS = 4000;

/**
 * Starts a Telegram typing loop for an active chat turn.
 *
 * @param chatId Target Telegram chat id.
 * @param sendTyping Sends one typing action.
 * @returns Stop function.
 */
export function startTelegramTypingLoop(
  chatId: number,
  sendTyping: (chatId: number) => Promise<void>,
): () => void {
  void sendTyping(chatId);

  const timer = setInterval(() => {
    void sendTyping(chatId);
  }, TELEGRAM_TYPING_INTERVAL_MS);

  return () => {
    clearInterval(timer);
  };
}
