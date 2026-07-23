import { randomUUID } from "node:crypto";
import type { AnnotationConversationEvent, AnnotationConversationEventKind } from "./types.js";

/**
 * Creates one timestamped annotation conversation event.
 *
 * @param kind Event category shown by the browser sidebar.
 * @param text Event copy shown to the user.
 * @returns New conversation event.
 */
export function createAnnotationConversationEvent(
  kind: AnnotationConversationEventKind,
  text: string,
): AnnotationConversationEvent {
  return { id: randomUUID(), kind, text, createdAt: new Date().toISOString() };
}
