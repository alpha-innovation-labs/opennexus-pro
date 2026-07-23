import { automationTemplates } from "./templates.js";
import type { AutomationTemplate } from "./types.js";

/**
 * Finds a bundled template by id.
 *
 * @param templateId Template id.
 * @returns Template or null.
 */
export function findAutomationTemplate(templateId: string): AutomationTemplate | null {
	return automationTemplates.find((template) => template.id === templateId) ?? null;
}
