import type { AnnotationAgentEvent } from "./types.js";

/**
 * Extracts display text from a real Nexus agent event message.
 *
 * @param event Nexus RPC event.
 * @returns Concatenated text content.
 */
export function extractAgentEventText(event: AnnotationAgentEvent): string {
  return event.message?.content
    ?.filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim() ?? "";
}
