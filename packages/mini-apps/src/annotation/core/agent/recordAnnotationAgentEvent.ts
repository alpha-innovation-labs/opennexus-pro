import { appendAnnotationConversationEvent } from "../conversations/appendAnnotationConversationEvent.js";
import { extractAgentEventText } from "./extractAgentEventText.js";
import { formatToolCallText } from "./formatToolCallText.js";
import type { AnnotationAgentEvent } from "./types.js";

/**
 * Persists one real Nexus RPC event into the annotation conversation stream.
 *
 * @param conversationId Annotation conversation id.
 * @param event Real Nexus RPC event.
 */
export async function recordAnnotationAgentEvent(conversationId: string, event: AnnotationAgentEvent): Promise<void> {
  if (event.type === "agent_start") {
    await appendAnnotationConversationEvent(conversationId, "status", "Nexus agent started.");
    return;
  }
  if (event.type === "message_update" && event.assistantMessageEvent?.type === "thinking_delta" && event.assistantMessageEvent.delta) {
    await appendAnnotationConversationEvent(conversationId, "thinking", event.assistantMessageEvent.delta);
    return;
  }
  if (event.type === "tool_execution_start") {
    await appendAnnotationConversationEvent(conversationId, "tool_call", formatToolCallText(event.toolName, event.args));
    return;
  }
  if (event.type === "tool_execution_end" && event.toolName === "resolve_annotation" && !event.isError) {
    const annotationId = typeof event.args?.annotationId === "string" ? event.args.annotationId : "";
    await appendAnnotationConversationEvent(conversationId, "resolved", annotationId ? `Resolved annotation ${annotationId}.` : "Resolved annotation.");
    return;
  }
  if (event.type === "message_end" && event.message?.role === "assistant") {
    const text = extractAgentEventText(event);
    if (text) await appendAnnotationConversationEvent(conversationId, "final", text);
    if (event.message.errorMessage) await appendAnnotationConversationEvent(conversationId, "error", event.message.errorMessage);
  }
}
