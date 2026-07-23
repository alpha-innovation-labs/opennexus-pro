import { buildObservationMessageExcerpt } from "@nexus/extensions/observations/tracker/buildObservationMessageExcerpt.js";
import type { ObservationState, StoredObservationMessage } from "@nexus/extensions/observations/tracker/types.js";
import { recreateObservationTopics } from "./recreateObservationTopics.js";
import type { RecreatedObservationTopic } from "./types/RecreatedObservationTopic.js";

/**
 * Rebuilds observation state with one LLM pass over the complete session history.
 *
 * @param conversationId Observation conversation id.
 * @param cwd Session working directory.
 * @param sessionFile Session file path.
 * @param messages Stored observation messages.
 * @returns Structured observation state.
 */
export async function createObservationStateFromMessages(
  conversationId: string,
  cwd: string,
  sessionFile: string,
  messages: readonly StoredObservationMessage[],
): Promise<ObservationState> {
  const state: ObservationState = { conversationId, cwd, sessionFile, updatedAt: Date.now(), messageCount: messages.length, summary: "", topics: [] };
  const recreatedTopics = await recreateObservationTopics(cwd, messages);
  appendRecreatedTopics(state, messages, recreatedTopics);
  if (state.topics.length === 0) {
    throw new Error(`Observation recreation produced 0 topics for ${messages.length} messages — LLM call failed`);
  }
  return state;
}

/**
 * Adds LLM-recreated final observations to the observation state.
 *
 * @param state Observation state being rebuilt.
 * @param messages Stored messages.
 * @param recreatedTopics LLM-derived topic observations.
 */
function appendRecreatedTopics(
  state: ObservationState,
  messages: readonly StoredObservationMessage[],
  recreatedTopics: readonly RecreatedObservationTopic[],
): void {
  const userMessages = messages.filter((message) => message.role === "user");
  for (const topic of recreatedTopics) {
    const topicMessages = userMessages.filter((message) => topic.sourceMessageIndexes.includes(message.index));
    const firstMessage = topicMessages[0];
    if (!firstMessage) continue;
    state.topics.push({
      index: state.topics.length + 1,
      title: topic.title,
      startedAt: firstMessage.timestamp,
      sourceMessageIndex: firstMessage.index,
      userMessageIndexes: topicMessages.map((message) => message.index),
      userMessages: resolveUserMessageExcerpts(topic, topicMessages),
      assistantBullets: topic.assistantBullets,
    });
  }
}

/**
 * Resolves user-message excerpts from LLM output or source messages.
 *
 * @param topic Recreated topic.
 * @param topicMessages Source user messages.
 * @returns User-message excerpts.
 */
function resolveUserMessageExcerpts(topic: RecreatedObservationTopic, topicMessages: readonly StoredObservationMessage[]): string[] {
  if (topic.userMessages && topic.userMessages.length > 0) return topic.userMessages;
  return topicMessages.map((message) => buildObservationMessageExcerpt(message.text));
}
