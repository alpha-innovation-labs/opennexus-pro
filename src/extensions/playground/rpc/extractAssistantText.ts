import type { PlaygroundAgentEvent } from "../types.js";

/**
 * Extracts assistant text from a completed RPC event payload.
 *
 * @param event RPC event payload.
 * @returns Extracted assistant text.
 */
export function extractAssistantText(event: PlaygroundAgentEvent): string {
	return (
		event.message?.content
			?.filter((part) => part.type === "text" && typeof part.text === "string")
			.map((part) => part.text ?? "")
			.join("") ?? ""
	);
}
