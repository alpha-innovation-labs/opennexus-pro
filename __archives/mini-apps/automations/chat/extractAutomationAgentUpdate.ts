import type { AutomationAgentUpdate } from "../modal/types.js";

/**
 * Extracts an automation update JSON object from assistant text.
 *
 * @param content Assistant message text.
 * @returns Parsed update, or null.
 */
export function extractAutomationAgentUpdate(content: string): AutomationAgentUpdate | null {
	const fenced = content.match(/```(?:automation_update|json)?\s*([\s\S]*?)```/u);
	const source = fenced?.[1] ?? content.match(/\{[\s\S]*\}/u)?.[0];
	if (!source) return null;
	const parsed = JSON.parse(source) as AutomationAgentUpdate;
	return sanitizeAutomationAgentUpdate(parsed);
}

/**
 * Keeps only supported automation update fields.
 *
 * @param update Raw update object.
 * @returns Sanitized update.
 */
function sanitizeAutomationAgentUpdate(update: AutomationAgentUpdate): AutomationAgentUpdate {
	return {
		...(typeof update.name === "string" ? { name: update.name } : {}),
		...(typeof update.scheduleText === "string" ? { scheduleText: update.scheduleText } : {}),
		...(typeof update.prompt === "string" ? { prompt: update.prompt } : {}),
		...(typeof update.cwd === "string" ? { cwd: update.cwd } : {}),
		...(typeof update.enabled === "boolean" ? { enabled: update.enabled } : {}),
	};
}
