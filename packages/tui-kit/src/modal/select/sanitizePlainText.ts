/**
 * Removes control characters and expands tabs for plain-text previews.
 *
 * @param text Source text.
 * @returns Sanitized text.
 */
export function sanitizePlainText(text: string): string {
	return text.replace(/\t/g, "    ").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
}
