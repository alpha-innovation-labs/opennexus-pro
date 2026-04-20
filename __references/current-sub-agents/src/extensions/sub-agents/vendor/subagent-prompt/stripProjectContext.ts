import { DATE_HEADER, PROJECT_CONTEXT_HEADER, SKILLS_HEADER } from "./headers.js";
import { findSectionEnd } from "./findSectionEnd.js";

/**
 * Removes the inherited project-context section from a Pi system prompt.
 *
 * @param prompt Full system prompt text.
 * @returns Prompt without the project-context block.
 */
export function stripProjectContext(prompt: string): string {
  const startIndex = prompt.indexOf(PROJECT_CONTEXT_HEADER);
  if (startIndex === -1) return prompt;
  const endIndex = findSectionEnd(prompt, startIndex + PROJECT_CONTEXT_HEADER.length, [SKILLS_HEADER, DATE_HEADER]);
  return `${prompt.slice(0, startIndex)}${prompt.slice(endIndex)}`;
}
