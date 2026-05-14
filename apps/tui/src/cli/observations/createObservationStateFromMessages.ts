import { buildObservationMessageExcerpt } from "@nexus/extensions-pro/observations/tracker/buildObservationMessageExcerpt.js";
import { summarizeAssistantObservations } from "@nexus/extensions-pro/observations/tracker/summarizeAssistantObservations.js";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { ObservationState, StoredObservationMessage } from "@nexus/extensions-pro/observations/tracker/types.js";
import { findTopicForMessageIndex } from "./findTopicForMessageIndex.js";
import { recreateObservationTopics } from "./recreateObservationTopics.js";
import type { RecreatedObservationTopic } from "./types/RecreatedObservationTopic.js";

const RECREATE_EXTENSION_API = {} as ExtensionAPI;

/**
 * Rebuilds observation state by rerunning the LLM-backed topic drift flow.
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
  const state: ObservationState = { conversationId, cwd, sessionFile, updatedAt: Date.now(), summary: "", topics: [] };
  const userMessages = messages.filter((message) => message.role === "user");
  const recreatedTopics = await recreateObservationTopics(cwd, userMessages);
  appendRecreatedTopics(state, userMessages, recreatedTopics);
  await appendAssistantObservations(state, cwd, messages);
  return state;
}

/**
 * Adds LLM-recreated topics to the observation state.
 *
 * @param state Observation state being rebuilt.
 * @param userMessages Stored user messages.
 * @param recreatedTopics LLM-derived topic observations.
 */
function appendRecreatedTopics(
  state: ObservationState,
  userMessages: readonly StoredObservationMessage[],
  recreatedTopics: readonly RecreatedObservationTopic[],
): void {
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
      userMessages: topicMessages.map((message) => buildObservationMessageExcerpt(message.text)),
      assistantBullets: [],
    });
  }
}

/**
 * Adds LLM-summarized assistant observations to recreated topics.
 *
 * @param state Observation state being rebuilt.
 * @param cwd Session working directory.
 * @param messages Stored messages.
 */
async function appendAssistantObservations(state: ObservationState, cwd: string, messages: readonly StoredObservationMessage[]): Promise<void> {
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    const topic = findTopicForMessageIndex(state.topics, message.index);
    if (!topic) continue;
    const bullets = await summarizeAssistantObservations(RECREATE_EXTENSION_API, { cwd }, topic.title, topic.assistantBullets, message.thinking ?? "", message.text);
    for (const bullet of bullets) {
      if (!topic.assistantBullets.includes(bullet)) topic.assistantBullets.push(bullet);
    }
  }
}
