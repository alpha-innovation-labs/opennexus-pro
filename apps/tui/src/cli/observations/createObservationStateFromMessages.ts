import { decideTopicTitle } from "@nexus/extensions-pro/observations/tracker/decideTopicTitle.js";
import { buildObservationMessageExcerpt } from "@nexus/extensions-pro/observations/tracker/buildObservationMessageExcerpt.js";
import { summarizeAssistantObservations } from "@nexus/extensions-pro/observations/tracker/summarizeAssistantObservations.js";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { ObservationState, StoredObservationMessage } from "@nexus/extensions-pro/observations/tracker/types.js";

const RECREATE_EXTENSION_API = {} as ExtensionAPI;

/**
 * Rebuilds observation state by rerunning the LLM-backed observation flow.
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
  for (const message of messages) {
    if (message.role === "user") await applyLlmUserObservation(state, cwd, message);
    if (message.role === "assistant") await applyLlmAssistantObservation(state, cwd, message);
  }
  return state;
}

/**
 * Applies one user message using the LLM topic decision only.
 *
 * @param state Observation state being rebuilt.
 * @param cwd Session working directory.
 * @param message Stored user message.
 */
async function applyLlmUserObservation(state: ObservationState, cwd: string, message: StoredObservationMessage): Promise<void> {
  const title = await decideTopicTitle(RECREATE_EXTENSION_API, { cwd }, state.topics.map((topic) => topic.title), message.text);
  if (title) {
    state.topics.push({
      index: state.topics.length + 1,
      title,
      startedAt: message.timestamp,
      sourceMessageIndex: message.index,
      userMessages: [buildObservationMessageExcerpt(message.text)],
      assistantBullets: [],
    });
    return;
  }
  const topic = state.topics.at(-1);
  if (topic) topic.userMessages.push(buildObservationMessageExcerpt(message.text));
}

/**
 * Applies one assistant message using the LLM assistant summarizer only.
 *
 * @param state Observation state being rebuilt.
 * @param cwd Session working directory.
 * @param message Stored assistant message.
 */
async function applyLlmAssistantObservation(state: ObservationState, cwd: string, message: StoredObservationMessage): Promise<void> {
  const topic = state.topics.at(-1);
  if (!topic) return;
  const bullets = await summarizeAssistantObservations(RECREATE_EXTENSION_API, { cwd }, topic.title, topic.assistantBullets, message.thinking ?? "", message.text);
  for (const bullet of bullets) {
    if (!topic.assistantBullets.includes(bullet)) topic.assistantBullets.push(bullet);
  }
}
