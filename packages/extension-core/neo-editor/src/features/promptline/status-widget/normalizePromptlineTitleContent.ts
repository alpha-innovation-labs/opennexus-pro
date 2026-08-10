import { normalizePromptlineTitleText } from "./normalizePromptlineTitleText";

/**
 * Converts session content into one compact status title.
 *
 * @param content Session message content.
 * @returns Trimmed single-line title, or undefined for unsupported content.
 */
export function normalizePromptlineTitleContent(content: unknown): string | undefined {
	if (typeof content === "string") return normalizePromptlineTitleText(content);
	if (!Array.isArray(content)) return undefined;

	const text = content
		.map((part) => {
			if (!part || typeof part !== "object") return "";
			const value = (part as { text?: unknown; content?: unknown }).text ?? (part as { text?: unknown; content?: unknown }).content;
			return typeof value === "string" ? value : "";
		})
		.join(" ");

	return normalizePromptlineTitleText(text);
}
