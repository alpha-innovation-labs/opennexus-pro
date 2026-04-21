import { escapeTelegramHtml } from "./escapeTelegramHtml.js";
import { replaceTelegramBold } from "./replaceTelegramBold.js";
import { replaceTelegramCodeBlocks } from "./replaceTelegramCodeBlocks.js";
import { replaceTelegramInlineCode } from "./replaceTelegramInlineCode.js";
import { restoreTelegramCodeBlockPlaceholders } from "./restoreTelegramCodeBlockPlaceholders.js";

/**
 * Converts a subset of markdown to Telegram HTML parse mode.
 *
 * @param text Nexus markdown text.
 * @returns Telegram-safe HTML text.
 */
export function formatTelegramHtml(text: string): string {
  const codeBlocks = replaceTelegramCodeBlocks(text);
  const escapedText = escapeTelegramHtml(codeBlocks.text);
  const boldText = replaceTelegramBold(escapedText);
  const inlineCodeText = replaceTelegramInlineCode(boldText);
  return restoreTelegramCodeBlockPlaceholders(inlineCodeText, codeBlocks.placeholders);
}
