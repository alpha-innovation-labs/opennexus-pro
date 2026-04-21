/**
 * Reads the configured Telegram bot token.
 *
 * @returns Trimmed bot token or undefined.
 */
export function readTelegramBotToken(): string | undefined {
  const value = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return value ? value : undefined;
}
