import type { AutomationRecord, AutomationRunRecord } from "../core/storage/types.js";
import { createAutomationDetailLines } from "./createAutomationDetailLines.js";

/**
 * Creates picker preview lines for an automation.
 *
 * @param automation Automation record.
 * @param latestRuns Latest run records ordered newest first.
 * @returns Preview lines.
 */
export function createAutomationPreviewLines(automation: AutomationRecord | undefined, latestRuns: AutomationRunRecord[] = []): string[] {
	return automation ? createAutomationDetailLines(automation, latestRuns) : ["No automation selected"];
}
