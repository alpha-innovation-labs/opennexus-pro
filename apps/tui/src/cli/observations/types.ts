export type ObservationArtifactKind = "messages" | "state" | "markdown";

/**
 * One grouped set of observation artifacts for a conversation/session.
 */
export type ObservationArtifactGroup = {
  conversationId: string;
  sessionId: string;
  messagesPath?: string;
  statePath?: string;
  markdownPath?: string;
};

/**
 * Machine-readable observation row printed by the CLI.
 */
export type ObservationListJsonRow = {
  conversationId: string;
  sessionId: string;
  hasMessages: boolean;
  hasState: boolean;
  hasMarkdown: boolean;
  messageCount: number;
  topicCount: number;
  updatedAt: string | null;
  sessionFile: string | null;
  messagesPath?: string;
  statePath?: string;
  markdownPath?: string;
};

/**
 * Parsed observation-management command request.
 */
export type ObservationCliRequest = {
  action: "list" | "delete" | "recreate" | "get-location";
  target?: string;
  json: boolean;
};
