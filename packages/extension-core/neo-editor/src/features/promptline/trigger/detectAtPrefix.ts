/**
 * Detects the active `@` autocomplete prefix before the cursor.
 *
 * @param textBeforeCursor Text before the cursor.
 * @returns Prefix or null.
 */
export function detectAtPrefix(textBeforeCursor: string): string | null {
	const match = textBeforeCursor.match(/(?:^|\s)(@(?:"[^"]*|[^\s]*))$/);
	return match?.[1] ?? null;
}
