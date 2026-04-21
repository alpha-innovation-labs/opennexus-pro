/**
 * Returns the first trimmed line from Telegram live-status text.
 *
 * @param text Input text.
 * @returns First line.
 */
export function firstTelegramLine(text: string | undefined | null): string {
  if (!text) {
    return "";
  }

  return text.replace(/\r\n/g, "\n").split("\n")[0]?.trim() ?? "";
}
