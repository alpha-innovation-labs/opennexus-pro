/**
 * Replaces markdown bold spans with Telegram HTML.
 *
 * @param text Markdown source text.
 * @returns Text with bold spans converted.
 */
export function replaceTelegramBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}
