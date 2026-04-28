const DEFAULT_INLINE_TEXT_LIMIT = 80;

/**
 * Truncates text to a compact single-line preview for annotation labels.
 *
 * @param text Raw text content.
 * @param limit Maximum number of characters before truncation.
 * @returns Normalized and truncated inline text.
 */
export function truncateInlineText(text: string, limit = DEFAULT_INLINE_TEXT_LIMIT): string {
  const normalizedText = text.trim().replace(/\s+/g, " ");
  if (normalizedText.length <= limit) return normalizedText;
  return `${normalizedText.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}
