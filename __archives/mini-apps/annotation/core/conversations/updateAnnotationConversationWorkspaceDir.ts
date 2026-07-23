import { readAnnotationConversationStore } from "./readAnnotationConversationStore.js";
import type { AnnotationConversation } from "./types.js";
import { writeAnnotationConversationStore } from "./writeAnnotationConversationStore.js";

/**
 * Updates the workspace directory attached to an annotation conversation.
 *
 * @param conversationId Conversation id to update.
 * @param workspaceDir Workspace directory used by the real Nexus agent.
 * @returns Updated conversation, or null when missing.
 */
export async function updateAnnotationConversationWorkspaceDir(
  conversationId: string,
  workspaceDir: string,
): Promise<AnnotationConversation | null> {
  const store = await readAnnotationConversationStore();
  const conversation = store.conversations.find((item) => item.id === conversationId);
  if (!conversation) return null;
  conversation.workspaceDir = workspaceDir;
  conversation.updatedAt = new Date().toISOString();
  await writeAnnotationConversationStore(store);
  return conversation;
}
