/**
 * Detects the active slash prefix before the cursor.
 *
 * @param textBeforeCursor Text before the cursor.
 * @returns Prefix or null.
 */
export function detectSlashPrefix(textBeforeCursor: string): string | null {
  return textBeforeCursor.startsWith("/") ? textBeforeCursor : null;
}
