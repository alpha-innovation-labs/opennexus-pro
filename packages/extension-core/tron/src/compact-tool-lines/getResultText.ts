import type { ToolResultBlock } from "./types";

/**
 * Extracts plain text from a tool result payload.
 *
 * @param result Tool result payload.
 * @returns Joined text output.
 */
export function getResultText(result: any): string {
	const content = Array.isArray(result?.content) ? (result.content as ToolResultBlock[]) : [];
	return content
		.map((block) => (block?.type === "text" ? block.text ?? "" : ""))
		.join("\n")
		.replace(/\r\n/g, "\n")
		.trim();
}
