import type { StoredObservationMessage } from "@nexus/extensions-pro/observations/tracker/types.js";

/**
 * Builds one LLM prompt that recreates final observations from full message history.
 *
 * @param messages Stored messages in chronological order.
 * @returns Prompt for the observation recreator.
 */
export function buildObservationRecreationPrompt(messages: readonly StoredObservationMessage[]): string {
  const messageLines = messages.map((message) => [
    `<message index="${message.index}" role="${message.role}">`,
    message.thinking ? `<thinking>${message.thinking}</thinking>` : undefined,
    `<text>${message.text}</text>`,
    "</message>",
  ].filter(Boolean).join("\n"));
  return [
    "You recreate the final high-level observation log for a conversation.",
    "Read the complete chronological message history once, then identify user-topic drift and the assistant observations for each topic.",
    "A new topic starts only when the user's goal materially changes. Merge adjacent messages that continue the same goal.",
    "Do not copy user messages as topic titles. Titles must summarize the general work area or intent.",
    "Assistant bullets must summarize decisions, findings, implementation direction, or important outcomes from assistant messages.",
    "Output ONLY valid JSON, with no markdown fences and no commentary.",
    "Schema: [{\"title\":\"verb-led topic under 8 words\",\"sourceMessageIndexes\":[1,3],\"userMessages\":[\"short user-message excerpt\"],\"assistantBullets\":[\"short observation\"]}]",
    "sourceMessageIndexes must contain only user message indexes covered by that topic.",
    "userMessages should be short excerpts, not full raw prompts.",
    "assistantBullets should be high-level and non-duplicative. Use an empty array when there are no material assistant observations.",
    "Examples of good titles: \"Review observation storage format\", \"Add session fork CLI\", \"Fix recreation performance\".",
    "Conversation messages:",
    messageLines.join("\n\n"),
  ].join("\n\n");
}
