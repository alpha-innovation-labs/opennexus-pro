import { appendAnnotationConversationEvent } from "../conversations/appendAnnotationConversationEvent.js";
import type { AnnotationConversation } from "../conversations/types.js";
import { annotationAgentRuntimes } from "./annotationAgentRuntimes.js";

/**
 * Stops the current real Nexus operation for an annotation conversation.
 *
 * @param conversation Conversation to stop.
 */
export async function stopAnnotationAgentConversation(conversation: AnnotationConversation): Promise<void> {
  const runtime = annotationAgentRuntimes.get(conversation.id);
  if (!runtime) {
    await appendAnnotationConversationEvent(conversation.id, "status", "No active Nexus chat to stop.");
    return;
  }

  try {
    await runtime.client.abort();
    runtime.busy = false;
    await appendAnnotationConversationEvent(conversation.id, "status", "Nexus chat stopped by user.");
  } catch (error) {
    await appendAnnotationConversationEvent(
      conversation.id,
      "error",
      error instanceof Error ? error.message : String(error),
    );
  }
}
