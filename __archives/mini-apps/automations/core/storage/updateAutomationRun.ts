import type { AutomationRunRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Updates mutable automation run fields.
 *
 * @param run Automation run record.
 */
export function updateAutomationRun(run: AutomationRunRecord): void {
	withAutomationDatabase((db) => {
		db.prepare(`
			UPDATE automation_runs
			SET status = ?, finished_at = ?, exit_code = ?, pid = ?, session_path = ?, log_path = ?, error = ?
			WHERE id = ?
		`).run(run.status, run.finishedAt, run.exitCode, run.pid, run.sessionPath, run.logPath, run.error, run.id);
	});
}
