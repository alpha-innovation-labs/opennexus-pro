import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Counts stored automations.
 *
 * @returns Total automation count.
 */
export function countAutomations(): number {
	return withAutomationDatabase((db) => {
		const row = db.prepare("SELECT COUNT(*) AS count FROM automations").get() as { count: number };
		return Number(row.count);
	});
}
