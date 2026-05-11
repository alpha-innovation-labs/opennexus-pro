import type { AutomationRecord } from "../core/storage/types.js";

/**
 * Formats one automation for CLI output.
 *
 * @param automation Automation record.
 * @returns Single-line automation summary.
 */
export function formatAutomation(automation: AutomationRecord): string {
	const state = automation.enabled ? "enabled" : "disabled";
	return `${automation.id}\t${automation.name}\t${state}\t${automation.scheduleText}\tnext=${automation.nextRunAt ?? "none"}\tcwd=${automation.cwd}`;
}
