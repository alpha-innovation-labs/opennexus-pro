import { mapAutomationRunRow } from "./mapAutomationRunRow.js";
import type { AutomationRunRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Lists latest failed automation runs.
 *
 * @param limit Maximum rows to return.
 * @returns Failed run records.
 */
export function listLatestFailures(limit: number): AutomationRunRecord[] {
	return withAutomationDatabase((db) =>
		db.prepare("SELECT * FROM automation_runs WHERE status = 'failed' ORDER BY started_at DESC LIMIT ?").all(limit)
			.map((row) => mapAutomationRunRow(row as Record<string, unknown>)),
	);
}
