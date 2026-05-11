import type { AutomationRecord } from "../core/storage/types.js";

/**
 * Builds the system prompt for the automation editor agent.
 *
 * @param automation Automation being edited.
 * @returns System prompt text.
 */
export function createAutomationChatSystemPrompt(automation: AutomationRecord): string {
	return [
		"You update one Nexus scheduled prompt automation.",
		"Return a concise user-facing explanation, then include exactly one fenced json block named automation_update.",
		"Only include fields that should change: name, scheduleText, prompt, cwd, enabled.",
		"Preserve user-provided prompt text unless the user asks to rewrite it.",
		"Current automation:",
		JSON.stringify({ name: automation.name, scheduleText: automation.scheduleText, prompt: automation.prompt, cwd: automation.cwd, enabled: automation.enabled }, null, 2),
		"Example:",
		"```automation_update\n{\"scheduleText\":\"every 4h\"}\n```",
	].join("\n\n");
}
