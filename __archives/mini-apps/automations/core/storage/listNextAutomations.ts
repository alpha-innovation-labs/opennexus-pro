import { mapAutomationRow } from "./mapAutomationRow.js";
import type { AutomationRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Lists the next enabled automations with scheduled timestamps.
 *
 * @param limit Maximum rows to return.
 * @returns Automation records ordered by next run.
 */
export function listNextAutomations(limit: number): AutomationRecord[] {
	return withAutomationDatabase((db) =>
		db.prepare("SELECT * FROM automations WHERE enabled = 1 AND next_run_at IS NOT NULL ORDER BY next_run_at ASC LIMIT ?").all(limit)
			.map((row) => mapAutomationRow(row as Record<string, unknown>)),
	);
}
