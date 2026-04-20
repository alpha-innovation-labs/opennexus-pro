import { DATE_HEADER, SKILLS_HEADER } from "./headers.js";
import { findSectionEnd } from "./findSectionEnd.js";

/**
 * Removes the inherited skills section from a Pi system prompt.
 *
 * @param prompt Full system prompt text.
 * @returns Prompt without the inherited-skills block.
 */
export function stripInheritedSkills(prompt: string): string {
  const startIndex = prompt.indexOf(SKILLS_HEADER);
  if (startIndex === -1) return prompt;
  const endIndex = findSectionEnd(prompt, startIndex + SKILLS_HEADER.length, [DATE_HEADER]);
  return `${prompt.slice(0, startIndex)}${prompt.slice(endIndex)}`;
}
