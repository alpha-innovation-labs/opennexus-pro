import { mapAutomationRunRow } from "./mapAutomationRunRow.js";
import type { AutomationRunRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Lists the latest runs for one automation.
 *
 * @param automationId Automation id.
 * @param limit Maximum run rows to return.
 * @returns Latest run records ordered newest first.
 */
export function listLatestRunsForAutomation(automationId: string, limit: number): AutomationRunRecord[] {
	return withAutomationDatabase((db) => db.prepare("SELECT * FROM automation_runs WHERE automation_id = ? ORDER BY started_at DESC LIMIT ?").all(automationId, limit).map((row) => mapAutomationRunRow(row as Record<string, unknown>)));
}
