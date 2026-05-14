import { buildFallbackTopicTitle } from "@nexus/extensions-pro/observations/tracker/buildFallbackTopicTitle.js";
import { buildObservationMessageExcerpt } from "@nexus/extensions-pro/observations/tracker/buildObservationMessageExcerpt.js";
import type { ObservationState, StoredObservationMessage } from "@nexus/extensions-pro/observations/tracker/types.js";

/**
 * Rebuilds deterministic observation state from stored messages.
 *
 * @param conversationId Observation conversation id.
 * @param cwd Session working directory.
 * @param sessionFile Session file path.
 * @param messages Stored observation messages.
 * @returns Structured observation state.
 */
export function createObservationStateFromMessages(
  conversationId: string,
  cwd: string,
  sessionFile: string,
  messages: readonly StoredObservationMessage[],
): ObservationState {
  const state: ObservationState = { conversationId, cwd, sessionFile, updatedAt: Date.now(), summary: "", topics: [] };
  for (const message of messages) {
    if (message.role === "user") {
      state.topics.push({
        index: state.topics.length + 1,
        title: buildFallbackTopicTitle(message.text),
        startedAt: message.timestamp,
        sourceMessageIndex: message.index,
        userMessages: [buildObservationMessageExcerpt(message.text)],
        assistantBullets: [],
      });
      continue;
    }
    const topic = state.topics.at(-1);
    const assistantText = message.text || message.thinking || "";
    if (topic && assistantText) topic.assistantBullets.push(buildObservationMessageExcerpt(assistantText));
  }
  return state;
}
