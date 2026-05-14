import { runObservationSummarizer } from "@nexus/extensions-pro/observations/tracker/runObservationSummarizer.js";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { StoredObservationMessage } from "@nexus/extensions-pro/observations/tracker/types.js";
import { buildObservationRecreationPrompt } from "./buildObservationRecreationPrompt.js";
import { parseRecreatedObservationTopics } from "./parseRecreatedObservationTopics.js";
import type { RecreatedObservationTopic } from "./types/RecreatedObservationTopic.js";

const RECREATE_EXTENSION_API = {} as ExtensionAPI;

/**
 * Uses an LLM to recreate high-level topics from user messages.
 *
 * @param cwd Session working directory.
 * @param userMessages Stored user messages.
 * @returns LLM-derived topic observations.
 */
export async function recreateObservationTopics(
  cwd: string,
  userMessages: readonly StoredObservationMessage[],
): Promise<RecreatedObservationTopic[]> {
  if (userMessages.length === 0) return [];
  const output = await runObservationSummarizer(RECREATE_EXTENSION_API, { cwd }, buildObservationRecreationPrompt(userMessages));
  return parseRecreatedObservationTopics(output);
}
