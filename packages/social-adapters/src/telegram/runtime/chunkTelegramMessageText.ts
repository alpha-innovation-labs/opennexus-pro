const TELEGRAM_MESSAGE_LIMIT = 4000;

/**
 * Splits a Telegram reply into Bot API-safe chunks.
 *
 * @param text Message text to split.
 * @returns Telegram message chunks.
 */
export function chunkTelegramMessageText(text: string): string[] {
  if (text.length <= TELEGRAM_MESSAGE_LIMIT) {
    return [text];
  }

  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += TELEGRAM_MESSAGE_LIMIT) {
    chunks.push(text.slice(index, index + TELEGRAM_MESSAGE_LIMIT));
  }
  return chunks;
}
