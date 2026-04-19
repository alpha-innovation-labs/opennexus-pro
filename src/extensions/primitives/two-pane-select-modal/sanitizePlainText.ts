/**
 * Removes control characters and expands tabs for plain-text previews.
 *
 * @param text Source text.
 * @returns Sanitized text.
 */
export function sanitizePlainText(text: string): string {
	return text.replace(/\t/g, "    ").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
