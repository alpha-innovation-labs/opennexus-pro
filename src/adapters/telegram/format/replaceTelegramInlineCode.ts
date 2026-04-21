import { escapeTelegramHtml } from "./escapeTelegramHtml.js";

/**
 * Replaces inline markdown code spans with Telegram HTML.
 *
 * @param text Markdown source text.
 * @returns Text with inline code converted.
 */
export function replaceTelegramInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, (_match, code: string) => `<code>${escapeTelegramHtml(code)}</code>`);
}
