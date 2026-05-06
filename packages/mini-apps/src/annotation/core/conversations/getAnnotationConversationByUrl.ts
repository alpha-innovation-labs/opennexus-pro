import { findConversationByUrl } from "./findConversationByUrl.js";
import { readAnnotationConversationStore } from "./readAnnotationConversationStore.js";
import type { AnnotationConversation } from "./types.js";

/**
 * Reads the newest annotation conversation for one page URL.
 *
 * @param url Browser page URL.
 * @returns Matching conversation, or null when absent.
 */
export async function getAnnotationConversationByUrl(url: string): Promise<AnnotationConversation | null> {
  const store = await readAnnotationConversationStore();
  return findConversationByUrl(store.conversations, url) ?? null;
}
