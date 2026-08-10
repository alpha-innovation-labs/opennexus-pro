import { readObservationPromptOverride } from "@extensions/observations/shared/readObservationPromptOverride";
import type { StoredObservationMessage } from "@extensions/observations/tracker/types";
import { formatObservationRecreationMessages } from "./formatObservationRecreationMessages";
import { renderObservationRecreationPrompt } from "./renderObservationRecreationPrompt";

/**
 * Builds one LLM prompt that recreates final observations from full message history.
 *
 * @param messages Stored messages in chronological order.
 * @returns Prompt for the observation recreator.
 */
export async function buildObservationRecreationPrompt(messages: readonly StoredObservationMessage[]): Promise<string> {
  return renderObservationRecreationPrompt(
    formatObservationRecreationMessages(messages),
    await readObservationPromptOverride(),
  );
}
