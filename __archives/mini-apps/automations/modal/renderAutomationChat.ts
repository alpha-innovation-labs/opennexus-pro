import type { AutomationChatMessage } from "./types.js";

/**
 * Renders automation editor chat messages and input.
 *
 * @param messages Chat messages.
 * @param input Current user input.
 * @param working Whether an agent request is active.
 * @returns Rendered chat lines.
 */
export function renderAutomationChat(messages: AutomationChatMessage[], input: string, working: boolean): string[] {
	const lines = messages.flatMap((message) => [`${message.role}>`, ...message.content.split(/\r?\n/u).map((line) => `  ${line}`), ""]);
	if (working) lines.push("agent> Working...");
	lines.push("> ", input || "Type an update request, then press Enter");
	return lines;
}
