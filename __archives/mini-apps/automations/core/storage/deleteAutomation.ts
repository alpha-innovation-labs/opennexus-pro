import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Deletes one automation and its run history.
 *
 * @param id Automation id.
 */
export function deleteAutomation(id: string): void {
	withAutomationDatabase((db) => {
		db.prepare("DELETE FROM automation_runs WHERE automation_id = ?").run(id);
		db.prepare("DELETE FROM automations WHERE id = ?").run(id);
	});
}
