import type { AnnotationConversation } from "./types.js";

/**
 * Finds the newest annotation conversation for a page URL.
 *
 * @param conversations Candidate conversations.
 * @param url Browser page URL.
 * @returns Matching conversation, or undefined when absent.
 */
export function findConversationByUrl(
  conversations: AnnotationConversation[],
  url: string,
): AnnotationConversation | undefined {
  return [...conversations].reverse().find((conversation) => conversation.url === url);
}
