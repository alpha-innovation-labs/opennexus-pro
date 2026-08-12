import { sanitizePlainText } from "@nexus/tui-kit";

/**
 * Builds a compact result preview from tool result content blocks.
 *
 * @param content Tool result content.
 * @returns Human-readable preview.
 */
export function previewContent(content: unknown): string {
	if (!Array.isArray(content) || content.length === 0)
		return "no result content";
	const parts = content.map((block) => {
		if (!block || typeof block !== "object") return "[unknown block]";
		const typedBlock = block as {
			type?: unknown;
			text?: unknown;
			mimeType?: unknown;
		};
		if (typedBlock.type === "text" && typeof typedBlock.text === "string")
			return typedBlock.text.trim();
		if (typedBlock.type === "image")
			return `[image${typeof typedBlock.mimeType === "string" ? `: ${typedBlock.mimeType}` : ""}]`;
		return `[${typeof typedBlock.type === "string" ? typedBlock.type : "unknown"}]`;
	});
	return sanitizePlainText(
		parts.join(" ").replace(/\s+/g, " ").trim() || "no result content",
	);
}
