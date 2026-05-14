import type { ObservationTopic } from "@nexus/extensions-pro/observations/tracker/types.js";

/**
 * Finds the topic that covers or most closely precedes a message index.
 *
 * @param topics Observation topics.
 * @param messageIndex Stored message index.
 * @returns Matching topic when available.
 */
export function findTopicForMessageIndex(topics: readonly ObservationTopic[], messageIndex: number): ObservationTopic | undefined {
  const exactTopic = topics.find((topic) => topic.sourceMessageIndex === messageIndex || topic.userMessageIndexes?.includes(messageIndex));
  if (exactTopic) return exactTopic;
  return [...topics].reverse().find((topic) => topic.sourceMessageIndex <= messageIndex);
}
