import { runObservationSummarizer } from "@extensions/observations/tracker/runObservationSummarizer";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { StoredObservationMessage } from "@extensions/observations/tracker/types";
import { buildObservationRecreationPrompt } from "./buildObservationRecreationPrompt";
import { parseRecreatedObservationTopics } from "./parseRecreatedObservationTopics";
import type { RecreatedObservationTopic } from "./types/RecreatedObservationTopic";

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
  const topics = parseRecreatedObservationTopics(output);
  if (topics.length === 0) {
    console.error(`[observations recreate] LLM returned 0 topics for ${messages.length} messages.`);
    console.error(`[observations recreate] Raw LLM output: ${JSON.stringify(output)}`);
  }
  return topics;
}
