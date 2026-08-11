/**
 * Removes control characters and expands tabs for plain-text previews.
 *
 * @param text Source text.
 * @returns Sanitized text.
 */
export function sanitizePlainText(text: string): string {
	return text
		.replace(/\t/g, "    ")
		.split("")
		.filter((c) => {
			const code = c.charCodeAt(0);
			return !(
				code === 0 ||
				(code >= 1 && code <= 8) ||
				code === 11 ||
				code === 12 ||
				(code >= 14 && code <= 31) ||
				code === 127
			);
		})
		.join("");
}
