import { mapAutomationRow } from "./mapAutomationRow.js";
import type { AutomationRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Finds one automation by id or exact name.
 *
 * @param idOrName Automation id or name.
 * @returns Matching automation, or null.
 */
export function getAutomationByIdOrName(idOrName: string): AutomationRecord | null {
	return withAutomationDatabase((db) => {
		const row = db.prepare("SELECT * FROM automations WHERE id = ? OR name = ? LIMIT 1").get(idOrName, idOrName);
		return row ? mapAutomationRow(row as Record<string, unknown>) : null;
	});
}
