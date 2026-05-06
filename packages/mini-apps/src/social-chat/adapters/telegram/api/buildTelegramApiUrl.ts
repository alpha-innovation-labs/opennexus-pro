/**
 * Builds a Telegram Bot API endpoint URL.
 *
 * @param token Telegram bot token.
 * @param method Bot API method name.
 * @returns Absolute Telegram API URL.
 */
export function buildTelegramApiUrl(token: string, method: string): string {
  return `https://api.telegram.org/bot${token}/${method}`;
}
