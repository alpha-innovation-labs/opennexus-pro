import { readAnnotationConversationStore } from "./readAnnotationConversationStore.js";
import type { AnnotationConversation } from "./types.js";

/**
 * Reads one annotation conversation by id.
 *
 * @param conversationId Conversation id to read.
 * @returns Matching conversation, or null when missing.
 */
export async function getAnnotationConversationById(conversationId: string): Promise<AnnotationConversation | null> {
  const store = await readAnnotationConversationStore();
  return store.conversations.find((conversation) => conversation.id === conversationId) ?? null;
}
