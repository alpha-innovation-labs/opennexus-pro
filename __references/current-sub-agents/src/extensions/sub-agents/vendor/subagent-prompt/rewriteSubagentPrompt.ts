import { stripInheritedSkills } from "./stripInheritedSkills.js";
import { stripProjectContext } from "./stripProjectContext.js";

export interface RewriteSubagentPromptOptions {
  inheritProjectContext: boolean;
  inheritSkills: boolean;
}

/**
 * Removes inherited prompt sections that a subagent should not receive.
 *
 * @param prompt Full system prompt text.
 * @param options Inheritance toggles for project context and skills.
 * @returns Rewritten system prompt.
 */
export function rewriteSubagentPrompt(
  prompt: string,
  options: RewriteSubagentPromptOptions,
): string {
  let rewritten = prompt;
  if (!options.inheritProjectContext) {
    rewritten = stripProjectContext(rewritten);
  }
  if (!options.inheritSkills) {
    rewritten = stripInheritedSkills(rewritten);
  }
  return rewritten;
}
