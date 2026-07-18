import { parseCommandArgs } from "@earendil-works/pi-coding-agent/dist/core/prompt-templates.js";
import { SENTINEL } from "@nexus/pi-platform/prompt-templates/applyPromptTemplateArgAppendPatch.js";
import type { SlashMenuState } from "../state.ts";

/**
 * Extracts trailing arguments from query after the matched command name.
 * Pure function — no side effects.
 */
export function extractSlashArgs(state: SlashMenuState, commandName: string): string {
  const prefix = `/${commandName}`;
  if (!state.query.startsWith(prefix)) return "";
  const afterCommand = state.query.slice(prefix.length);
  if (!afterCommand.startsWith(" ")) return "";
  const argsString = afterCommand.slice(1);
  const args = parseCommandArgs(argsString);
  return args.join(" ");
}
