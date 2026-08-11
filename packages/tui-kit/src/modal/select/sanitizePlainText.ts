/**
 * Removes control characters and expands tabs for plain-text previews.
 *
 * @param text Source text.
 * @returns Sanitized text.
 */
export function sanitizePlainText(text: string): string {
	return text.replace(/\t/g, "    ").replace(new RegExp("[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]", "g"), "");
}
