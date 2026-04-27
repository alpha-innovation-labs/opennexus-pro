import { sanitizePlainText } from "@nexus/tui-kit/modal/index.js";

/**
 * Converts free-form text into sanitized display lines.
 *
 * @param text Source text.
 * @returns Sanitized lines.
 */
export function toPlainTextLines(text: string): string[] {
	return sanitizePlainText(text).split("\n");
}
