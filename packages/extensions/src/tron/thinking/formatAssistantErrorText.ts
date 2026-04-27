import { extractAssistantErrorMessage } from "./extractAssistantErrorMessage.js";

const assistantErrorIcon = "✗";

/**
 * Formats one Tron assistant provider error label.
 *
 * @param errorMessage Provider error text.
 * @returns Error text with the Nexus error prefix.
 */
export function formatAssistantErrorText(errorMessage: string): string {
  return `${assistantErrorIcon} error ${extractAssistantErrorMessage(errorMessage)}`;
}
