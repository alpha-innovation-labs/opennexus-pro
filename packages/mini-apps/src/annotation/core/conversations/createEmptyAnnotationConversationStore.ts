import type { AnnotationConversationStore } from "./types.js";

/**
 * Creates an empty durable annotation conversation store.
 *
 * @returns Empty conversation store.
 */
export function createEmptyAnnotationConversationStore(): AnnotationConversationStore {
  return { conversations: [] };
}
