import { createAutomation } from "../core/storage/createAutomation.js";
import { buildAutomationInput } from "./buildAutomationInput.js";
import { hasFlag } from "./hasFlag.js";
import { readFlagValue } from "./readFlagValue.js";
import { readPositional } from "./readPositional.js";
import { readPromptFromEditor } from "./readPromptFromEditor.js";

/**
 * Runs the automations create command.
 *
 * @param argv Raw command args.
 * @returns Exit code.
 */
export function runCreateAutomationCommand(argv: readonly string[]): number {
	const name = readPositional(argv, 2);
	const schedule = readFlagValue(argv, "--schedule");
	if (!name || !schedule) {
		console.error("Usage: nexus automations create <name> --schedule <cron|shorthand> --prompt <text>");
		return 1;
	}
	const prompt = readFlagValue(argv, "--prompt") ?? readPromptFromEditor();
	const cwd = readFlagValue(argv, "--cwd") ?? process.cwd();
	const record = createAutomation(buildAutomationInput(name, schedule, prompt, cwd, !hasFlag(argv, "--disabled")));
	console.log(`Created automation: ${record.name}`);
	console.log(`ID: ${record.id}`);
	return 0;
}
