import { appendAnnotationConversationEvent } from "../conversations/appendAnnotationConversationEvent.js";
import type { AnnotationConversation } from "../conversations/types.js";
import { getOrStartAnnotationAgentRuntime } from "./getOrStartAnnotationAgentRuntime.js";
import { shouldRunAnnotationAgent } from "./shouldRunAnnotationAgent.js";

/**
 * Sends a steering message to the real Nexus runtime for an annotation conversation.
 *
 * @param conversation Conversation to steer.
 * @param message User steering instructions.
 */
export async function steerAnnotationAgentConversation(
  conversation: AnnotationConversation,
  message: string,
): Promise<void> {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    await appendAnnotationConversationEvent(conversation.id, "error", "Steering message is required.");
    return;
  }
  if (!conversation.workspaceDir) {
    await appendAnnotationConversationEvent(conversation.id, "error", "Workspace directory is required before steering Nexus.");
    return;
  }

  await appendAnnotationConversationEvent(conversation.id, "user", `Steer: ${trimmedMessage}`);
  if (!shouldRunAnnotationAgent()) return;

  try {
    const runtime = await getOrStartAnnotationAgentRuntime(conversation.id, conversation.workspaceDir);
    if (runtime.busy) await runtime.client.steer(trimmedMessage);
    else await runtime.client.followUp(trimmedMessage);
  } catch (error) {
    await appendAnnotationConversationEvent(
      conversation.id,
      "error",
      error instanceof Error ? error.message : String(error),
    );
  }
}
