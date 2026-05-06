import type { AnnotationConversationEventKind } from "./types.js";

/**
 * Reports whether adjacent stream chunks should render as one sidebar block.
 *
 * @param kind Event kind being appended.
 * @returns True when the event is a streaming text chunk.
 */
export function shouldMergeAnnotationConversationEvent(kind: AnnotationConversationEventKind): boolean {
  return kind === "thinking" || kind === "assistant";
}
