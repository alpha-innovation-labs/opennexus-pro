import {
  DEFAULT_OBSERVATION_RECREATION_PROMPT_TEMPLATE,
  OBSERVATION_RECREATION_MESSAGES_PLACEHOLDER,
} from "@nexus/extensions/observations/shared/defaultObservationRecreationPromptTemplate.js";

/**
 * Renders an observation recreation prompt from a template and message history.
 *
 * @param messageHistory Formatted message history.
 * @param template Optional prompt template override.
 * @returns Full prompt sent to the LLM.
 */
export function renderObservationRecreationPrompt(messageHistory: string, template = DEFAULT_OBSERVATION_RECREATION_PROMPT_TEMPLATE): string {
  if (template.includes(OBSERVATION_RECREATION_MESSAGES_PLACEHOLDER)) {
    return template.replaceAll(OBSERVATION_RECREATION_MESSAGES_PLACEHOLDER, messageHistory);
  }
  return [template.trim(), "Conversation messages:", messageHistory].join("\n\n");
}
