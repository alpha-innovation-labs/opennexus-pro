import { mapAutomationRow } from "./mapAutomationRow.js";
import type { AutomationRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Lists enabled automations due at or before the provided time.
 *
 * @param nowIso Current ISO timestamp.
 * @returns Due automation records.
 */
export function listDueAutomations(nowIso: string): AutomationRecord[] {
	return withAutomationDatabase((db) =>
		db.prepare("SELECT * FROM automations WHERE enabled = 1 AND next_run_at IS NOT NULL AND next_run_at <= ? ORDER BY next_run_at ASC").all(nowIso)
			.map((row) => mapAutomationRow(row as Record<string, unknown>)),
	);
}
