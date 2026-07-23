import { createAnnotationConversationEvent } from "./createAnnotationConversationEvent.js";
import { readAnnotationConversationStore } from "./readAnnotationConversationStore.js";
import { shouldMergeAnnotationConversationEvent } from "./shouldMergeAnnotationConversationEvent.js";
import type { AnnotationConversation, AnnotationConversationEventKind } from "./types.js";
import { withAnnotationConversationStoreLock } from "./withAnnotationConversationStoreLock.js";
import { writeAnnotationConversationStore } from "./writeAnnotationConversationStore.js";

/**
 * Appends one real Nexus stream event to an annotation conversation.
 *
 * @param conversationId Conversation id to update.
 * @param kind Event category shown by the browser sidebar.
 * @param text Event text from the real agent stream.
 * @returns Updated conversation, or null when missing.
 */
export async function appendAnnotationConversationEvent(
  conversationId: string,
  kind: AnnotationConversationEventKind,
  text: string,
): Promise<AnnotationConversation | null> {
  return withAnnotationConversationStoreLock(async () => {
    const store = await readAnnotationConversationStore();
    const conversation = store.conversations.find((item) => item.id === conversationId);
    if (!conversation) return null;
    const previous = conversation.events.at(-1);
    if (previous?.kind === kind && shouldMergeAnnotationConversationEvent(kind)) {
      previous.text = `${previous.text}${text}`;
      previous.createdAt = new Date().toISOString();
    } else {
      conversation.events.push(createAnnotationConversationEvent(kind, text));
    }
    conversation.updatedAt = new Date().toISOString();
    await writeAnnotationConversationStore(store);
    return conversation;
  });
}
