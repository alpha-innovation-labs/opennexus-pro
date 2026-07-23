import { appendAnnotationConversationEvent } from "../conversations/appendAnnotationConversationEvent.js";
import type { AnnotationConversation } from "../conversations/types.js";
import type { StoredAnnotation } from "../store/types.js";
import { buildAnnotationAgentPrompt } from "./buildAnnotationAgentPrompt.js";
import { getOrStartAnnotationAgentRuntime } from "./getOrStartAnnotationAgentRuntime.js";

/**
 * Sends an annotation submission to the real Nexus chat for code edits.
 *
 * @param conversation Annotation conversation to continue.
 * @param annotation Stored annotation submitted by the browser.
 */
export async function runAnnotationAgentTurn(
  conversation: AnnotationConversation,
  annotation: StoredAnnotation,
): Promise<void> {
  if (!conversation.workspaceDir) {
    await appendAnnotationConversationEvent(conversation.id, "error", "Workspace directory is required before starting Nexus.");
    return;
  }

  try {
    const runtime = await getOrStartAnnotationAgentRuntime(conversation.id, conversation.workspaceDir);
    const prompt = buildAnnotationAgentPrompt(annotation, conversation.workspaceDir);
    if (runtime.busy) await runtime.client.followUp(prompt);
    else await runtime.client.prompt(prompt);
  } catch (error) {
    await appendAnnotationConversationEvent(
      conversation.id,
      "error",
      error instanceof Error ? error.message : String(error),
    );
  }
}
