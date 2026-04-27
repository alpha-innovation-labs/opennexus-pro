import { baseSystemPrompt } from "@nexus/assets/prompts/base-system-prompt/baseSystemPrompt.js";
import { hasBaseSystemPromptArg } from "./hasBaseSystemPromptArg.js";

/**
 * Adds the bundled base system prompt append argument once.
 *
 * @param args Raw Pi CLI arguments.
 * @returns Arguments including the bundled append-system-prompt pair.
 */
export function addBaseSystemPromptArg(args: string[]): string[] {
  if (hasBaseSystemPromptArg(args)) {
    return args;
  }

  return ["--append-system-prompt", baseSystemPrompt, ...args];
}
