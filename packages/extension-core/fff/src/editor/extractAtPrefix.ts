import { findLastDelimiter } from "./findLastDelimiter.js";
import { findUnclosedQuoteStart } from "./findUnclosedQuoteStart.js";
import { isTokenStart } from "./isTokenStart.js";

/**
 * Extracts the active `@...` autocomplete prefix from editor text.
 *
 * @param text Current text before the cursor.
 * @returns Active prefix or null.
 */
export function extractAtPrefix(text: string): string | null {
  const quoteStart = findUnclosedQuoteStart(text);
  if (quoteStart !== null && quoteStart > 0 && text[quoteStart - 1] === "@" && isTokenStart(text, quoteStart - 1)) {
    return text.slice(quoteStart - 1);
  }

  const lastDelimiterIndex = findLastDelimiter(text);
  const tokenStart = lastDelimiterIndex === -1 ? 0 : lastDelimiterIndex + 1;
  return text[tokenStart] === "@" ? text.slice(tokenStart) : null;
}
