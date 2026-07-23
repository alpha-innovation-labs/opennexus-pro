import { mapAutomationRow } from "./mapAutomationRow.js";
import type { AutomationRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Lists all stored automations ordered by name.
 *
 * @returns Automation records.
 */
export function listAutomations(): AutomationRecord[] {
	return withAutomationDatabase((db) =>
		db.prepare("SELECT * FROM automations ORDER BY name ASC").all().map((row) => mapAutomationRow(row as Record<string, unknown>)),
	);
}
