/**
 * Escapes text for Telegram HTML parse mode.
 *
 * @param text Raw text.
 * @returns HTML-escaped text.
 */
export function escapeTelegramHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
