/**
 * Normalizes slash-menu text for case-insensitive fuzzy matching.
 *
 * @param text Raw text to normalize.
 * @returns Lowercase text with punctuation collapsed to spaces.
 */
export function normalizeSearchText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
}
