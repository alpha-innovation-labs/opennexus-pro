import type { AutomationTemplate } from "../core/templates/types.js";

/**
 * Formats one automation template for CLI output.
 *
 * @param template Automation template.
 * @returns Single-line template summary.
 */
export function formatAutomationTemplate(template: AutomationTemplate): string {
	return `${template.id}\t${template.name}\tdefault=${template.defaultSchedule}\t${template.description}`;
}
