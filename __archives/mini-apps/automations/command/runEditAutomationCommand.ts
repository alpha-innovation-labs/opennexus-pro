import { buildAutomationInput } from "./buildAutomationInput.js";
import { getAutomationByIdOrName } from "../core/storage/getAutomationByIdOrName.js";
import { hasFlag } from "./hasFlag.js";
import { readFlagValue } from "./readFlagValue.js";
import { readPositional } from "./readPositional.js";
import { readPromptFromEditor } from "./readPromptFromEditor.js";
import { updateAutomation } from "../core/storage/updateAutomation.js";

/**
 * Runs the automations edit command.
 *
 * @param argv Raw command args.
 * @returns Exit code.
 */
export function runEditAutomationCommand(argv: readonly string[]): number {
	const target = readPositional(argv, 2);
	if (!target) {
		console.error("Usage: nexus automations edit <id|name>");
		return 1;
	}
	const existing = getAutomationByIdOrName(target);
	if (!existing) {
		console.error(`Automation not found: ${target}`);
		return 1;
	}
	const promptFlag = readFlagValue(argv, "--prompt");
	const prompt = promptFlag ?? (hasFlag(argv, "--edit-prompt") ? readPromptFromEditor(existing.prompt) : existing.prompt);
	const enabled = hasFlag(argv, "--disabled") ? false : hasFlag(argv, "--enabled") ? true : existing.enabled;
	const input = buildAutomationInput(readFlagValue(argv, "--name") ?? existing.name, readFlagValue(argv, "--schedule") ?? existing.scheduleText, prompt, readFlagValue(argv, "--cwd") ?? existing.cwd, enabled);
	updateAutomation(existing.id, input);
	console.log(`Updated automation: ${input.name}`);
	return 0;
}
