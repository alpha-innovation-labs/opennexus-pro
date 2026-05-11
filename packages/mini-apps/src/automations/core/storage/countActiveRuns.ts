import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Counts active running automation runs.
 *
 * @returns Active run count.
 */
export function countActiveRuns(): number {
	return withAutomationDatabase((db) => {
		const row = db.prepare("SELECT COUNT(*) AS count FROM automation_runs WHERE status = 'running' AND finished_at IS NULL").get() as { count: number };
		return Number(row.count);
	});
}
