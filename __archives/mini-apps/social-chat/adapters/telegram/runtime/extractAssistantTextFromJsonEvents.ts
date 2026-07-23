import { extractAssistantTextFromAgentEndEvent } from "./extractAssistantTextFromAgentEndEvent.js";

/**
 * Extracts the final assistant text from Nexus JSON mode events.
 *
 * @param lines JSONL output lines from a Nexus child run.
 * @returns Final assistant text.
 */
export function extractAssistantTextFromJsonEvents(lines: string[]): string {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index]?.trim();
    if (!line) {
      continue;
    }

    const event = JSON.parse(line) as {
      type?: string;
      messages?: Array<{ role?: string; content?: Array<{ type?: string; text?: string }> }>;
    };
    if (event.type === "agent_end") {
      return extractAssistantTextFromAgentEndEvent(event);
    }
  }

  throw new Error("Nexus child run did not produce a final assistant message");
}
