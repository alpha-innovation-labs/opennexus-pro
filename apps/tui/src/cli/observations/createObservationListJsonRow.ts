import { readJsonFile } from "./readJsonFile.js";
import type { ObservationArtifactGroup, ObservationListJsonRow } from "./types.js";

type ObservationStateLike = { topics?: unknown[]; updatedAt?: number; sessionFile?: string | null };
type ObservationMessagesLike = { messages?: unknown[]; updatedAt?: number; sessionFile?: string | null };

/**
 * Builds a machine-readable list row for one observation group.
 *
 * @param group Observation artifact group.
 * @returns JSON-safe observation row.
 */
export async function createObservationListJsonRow(group: ObservationArtifactGroup): Promise<ObservationListJsonRow> {
  const state = await readJsonFile(group.statePath) as ObservationStateLike | undefined;
  const messages = await readJsonFile(group.messagesPath) as ObservationMessagesLike | undefined;
  const updatedAt = typeof state?.updatedAt === "number" ? state.updatedAt : typeof messages?.updatedAt === "number" ? messages.updatedAt : undefined;
  const sessionFile = typeof state?.sessionFile === "string" || state?.sessionFile === null
    ? state.sessionFile
    : typeof messages?.sessionFile === "string" || messages?.sessionFile === null
      ? messages.sessionFile
      : null;

  return {
    conversationId: group.conversationId,
    sessionId: group.sessionId,
    hasMessages: Boolean(group.messagesPath),
    hasState: Boolean(group.statePath),
    hasMarkdown: Boolean(group.markdownPath),
    messageCount: Array.isArray(messages?.messages) ? messages.messages.length : 0,
    topicCount: Array.isArray(state?.topics) ? state.topics.length : 0,
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null,
    sessionFile,
    messagesPath: group.messagesPath,
    statePath: group.statePath,
    markdownPath: group.markdownPath,
  };
}
