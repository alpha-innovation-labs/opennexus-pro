import { sanitizePlainText } from "../../shared/two-pane-select-modal/index.js";

/**
 * Builds a compact preview from message content.
 *
 * @param content Message content.
 * @param max Maximum preview length.
 * @returns Sanitized preview text.
 */
export function getMessagePreview(content: unknown, max = 100): string {
	if (typeof content === "string") {
		const text = content.replace(/\s+/g, " ").trim();
		return sanitizePlainText(text.length > max ? `${text.slice(0, max - 1)}…` : text);
	}
	if (!Array.isArray(content)) return "";
	const text = content
		.filter(
			(block): block is { type: "text"; text: string } =>
				!!block && typeof block === "object" && (block as { type?: unknown }).type === "text" && typeof (block as { text?: unknown }).text === "string",
		)
		.map((block) => block.text)
		.join(" ")
		.replace(/\s+/g, " ")
		.trim();
	return sanitizePlainText(text.length > max ? `${text.slice(0, max - 1)}…` : text);
}
