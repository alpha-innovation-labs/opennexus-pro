import type { AutomationRecord, AutomationRunRecord } from "../core/storage/types.js";
import { createAutomationRunSummaryLines } from "./createAutomationRunSummaryLines.js";

/**
 * Creates left-pane detail lines for an automation.
 *
 * @param automation Automation record.
 * @param latestRuns Latest run records ordered newest first.
 * @returns Detail lines.
 */
export function createAutomationDetailLines(automation: AutomationRecord, latestRuns: AutomationRunRecord[] = []): string[] {
	return [
		`Name: ${automation.name}`,
		`ID: ${automation.id}`,
		`Status: ${automation.enabled ? "enabled" : "disabled"}`,
		`Schedule: ${automation.scheduleText}`,
		`Cron: ${automation.cronExpression}`,
		`Next run: ${automation.nextRunAt ?? "none"}`,
		`CWD: ${automation.cwd}`,
		...createAutomationRunSummaryLines(latestRuns),
		"",
		"Prompt:",
		...automation.prompt.split(/\r?\n/u),
	];
}
