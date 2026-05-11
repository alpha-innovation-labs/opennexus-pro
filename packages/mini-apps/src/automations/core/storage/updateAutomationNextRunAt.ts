import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Updates the next scheduled run timestamp for an automation.
 *
 * @param id Automation id.
 * @param nextRunAt Next run timestamp, or null.
 */
export function updateAutomationNextRunAt(id: string, nextRunAt: string | null): void {
	withAutomationDatabase((db) => {
		db.prepare("UPDATE automations SET next_run_at = ?, updated_at = ? WHERE id = ?").run(nextRunAt, new Date().toISOString(), id);
	});
}
