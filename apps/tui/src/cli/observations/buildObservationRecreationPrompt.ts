import type { StoredObservationMessage } from "@nexus/extensions-pro/observations/tracker/types.js";

/**
 * Builds an LLM prompt that recreates high-level topic observations from user messages.
 *
 * @param userMessages Stored user messages in chronological order.
 * @returns Prompt for the observation recreator.
 */
export function buildObservationRecreationPrompt(userMessages: readonly StoredObservationMessage[]): string {
  const messageLines = userMessages.map((message) => `<message index="${message.index}">\n${message.text}\n</message>`);
  return [
    "You recreate a high-level observation timeline from user messages in a conversation.",
    "Your job is to detect topic drift: when the user starts talking about a materially different goal, create a new topic.",
    "Do not copy user messages as topic titles. Topic titles must summarize the general work area or intent.",
    "Merge adjacent messages that continue the same topic, even if wording changes.",
    "Output ONLY valid JSON, with no markdown fences and no commentary.",
    "Schema: [{\"title\":\"high-level topic under 8 words\",\"sourceMessageIndexes\":[1,2]}]",
    "Each sourceMessageIndexes array must contain one or more message indexes from the input.",
    "Use concise verb-led titles, such as \"Review observation storage format\" or \"Add session fork CLI\".",
    "User messages:",
    messageLines.join("\n\n"),
  ].join("\n\n");
}
