import { renderTelegramCodeBlock } from "./renderTelegramCodeBlock.js";

/**
 * Replaces fenced markdown code blocks with Telegram HTML placeholders.
 *
 * @param text Markdown source text.
 * @returns Text and extracted HTML placeholders.
 */
export function replaceTelegramCodeBlocks(text: string): { text: string; placeholders: string[] } {
  const placeholders: string[] = [];
  const nextText = text.replace(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g, (_match, language: string | undefined, code: string) => {
    const token = `__TELEGRAM_CODE_BLOCK_${String(placeholders.length)}__`;
    placeholders.push(renderTelegramCodeBlock(language, code));
    return token;
  });

  return { text: nextText, placeholders };
}
