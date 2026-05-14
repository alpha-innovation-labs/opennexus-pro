import { runObservationSummarizer } from "@nexus/extensions-pro/observations/tracker/runObservationSummarizer.js";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { StoredObservationMessage } from "@nexus/extensions-pro/observations/tracker/types.js";
import { buildObservationRecreationPrompt } from "./buildObservationRecreationPrompt.js";
import { parseRecreatedObservationTopics } from "./parseRecreatedObservationTopics.js";
import type { RecreatedObservationTopic } from "./types/RecreatedObservationTopic.js";

const RECREATE_EXTENSION_API = {} as ExtensionAPI;

/**
 * Uses one LLM call to recreate final observations from complete message history.
 *
 * @param cwd Session working directory.
 * @param messages Stored messages.
 * @returns LLM-derived topic observations.
 */
export async function recreateObservationTopics(
  cwd: string,
  messages: readonly StoredObservationMessage[],
): Promise<RecreatedObservationTopic[]> {
  if (messages.length === 0) return [];
  const output = await runObservationSummarizer(RECREATE_EXTENSION_API, { cwd }, await buildObservationRecreationPrompt(messages));
  return parseRecreatedObservationTopics(output);
}
