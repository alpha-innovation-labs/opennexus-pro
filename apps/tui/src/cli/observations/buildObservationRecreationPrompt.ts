import { readObservationPromptOverride } from "@nexus/extensions-pro/observations/shared/readObservationPromptOverride.js";
import type { StoredObservationMessage } from "@nexus/extensions-pro/observations/tracker/types.js";
import { formatObservationRecreationMessages } from "./formatObservationRecreationMessages.js";
import { renderObservationRecreationPrompt } from "./renderObservationRecreationPrompt.js";

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
