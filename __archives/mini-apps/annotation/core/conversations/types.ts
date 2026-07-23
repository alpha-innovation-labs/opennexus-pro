export type AnnotationConversationEventKind = "user" | "thinking" | "assistant" | "tool_call" | "tool_result" | "final" | "status" | "resolved" | "error";

export interface AnnotationConversationEvent {
  id: string;
  kind: AnnotationConversationEventKind;
  text: string;
  createdAt: string;
}

export interface AnnotationConversation {
  id: string;
  url: string;
  workspaceDir: string;
  annotationIds: string[];
  events: AnnotationConversationEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationConversationStore {
  conversations: AnnotationConversation[];
}
