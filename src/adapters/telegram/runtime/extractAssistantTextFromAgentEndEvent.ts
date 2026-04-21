/**
 * Extracts the final assistant text from an agent_end event payload.
 *
 * @param event Parsed agent_end event.
 * @returns Final assistant text.
 */
export function extractAssistantTextFromAgentEndEvent(event: {
  messages?: Array<{ role?: string; content?: Array<{ type?: string; text?: string }> }>;
}): string {
  const assistantMessage = [...(event.messages ?? [])].reverse().find((message) => message.role === "assistant");
  const text = assistantMessage?.content?.find((content) => content.type === "text")?.text?.trim();

  if (!text) {
    throw new Error("Nexus child run did not produce a final assistant message");
  }

  return text;
}
