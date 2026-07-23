import { createAutomation } from "../core/storage/createAutomation.js";
import { automationTemplates } from "../core/templates/templates.js";
import { findAutomationTemplate } from "../core/templates/findAutomationTemplate.js";
import { buildAutomationInput } from "./buildAutomationInput.js";
import { formatAutomationTemplate } from "./formatAutomationTemplate.js";
import { hasFlag } from "./hasFlag.js";
import { readFlagValue } from "./readFlagValue.js";
import { readPositional } from "./readPositional.js";
import { readPromptFromEditor } from "./readPromptFromEditor.js";

/**
 * Runs automations templates subcommands.
 *
 * @param argv Raw command args.
 * @returns Exit code.
 */
export function runTemplatesCommand(argv: readonly string[]): number {
	if (readPositional(argv, 2) === "list") {
		for (const template of automationTemplates) console.log(formatAutomationTemplate(template));
		return 0;
	}
	if (readPositional(argv, 2) !== "use") return 1;
	const templateId = readPositional(argv, 3);
	const template = templateId ? findAutomationTemplate(templateId) : null;
	if (!template) {
		console.error(`Template not found: ${templateId ?? ""}`);
		return 1;
	}
	const name = readFlagValue(argv, "--name") ?? template.name;
	const schedule = readFlagValue(argv, "--schedule") ?? template.defaultSchedule;
	const prompt = hasFlag(argv, "--yes") ? template.prompt : readPromptFromEditor(template.prompt);
	const record = createAutomation(buildAutomationInput(name, schedule, prompt, readFlagValue(argv, "--cwd") ?? process.cwd(), true));
	console.log(`Created automation from template: ${record.name}`);
	console.log(`ID: ${record.id}`);
	return 0;
}
