import { mapAutomationRunRow } from "./mapAutomationRunRow.js";
import type { AutomationRunRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Finds the active run for an automation.
 *
 * @param automationId Automation id.
 * @returns Active run, or null.
 */
export function getActiveRunForAutomation(automationId: string): AutomationRunRecord | null {
	return withAutomationDatabase((db) => {
		const row = db.prepare("SELECT * FROM automation_runs WHERE automation_id = ? AND status = 'running' AND finished_at IS NULL LIMIT 1").get(automationId);
		return row ? mapAutomationRunRow(row as Record<string, unknown>) : null;
	});
}
