import { escapeTelegramHtml } from "./escapeTelegramHtml.js";

/**
 * Renders a fenced markdown block as Telegram HTML.
 *
 * @param language Optional fenced code language.
 * @param code Code block text.
 * @returns Telegram HTML fragment.
 */
export function renderTelegramCodeBlock(language: string | undefined, code: string): string {
  const className = language ? ` class=\"language-${escapeTelegramHtml(language)}\"` : "";
  return `<pre><code${className}>${escapeTelegramHtml(code)}</code></pre>`;
}
