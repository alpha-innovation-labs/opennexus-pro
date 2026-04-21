/**
 * Restores Telegram code block placeholders.
 *
 * @param text Text containing placeholders.
 * @param placeholders Extracted HTML blocks.
 * @returns Text with placeholders restored.
 */
export function restoreTelegramCodeBlockPlaceholders(text: string, placeholders: string[]): string {
  let nextText = text;

  for (const [index, placeholder] of placeholders.entries()) {
    nextText = nextText.replace(`__TELEGRAM_CODE_BLOCK_${String(index)}__`, placeholder);
  }

  return nextText;
}
