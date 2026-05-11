import { randomUUID } from "node:crypto";
import type { AutomationRunRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Creates an automation run record.
 *
 * @param run Run fields without id.
 * @returns Created run record.
 */
export function createAutomationRun(run: Omit<AutomationRunRecord, "id">): AutomationRunRecord {
	const record: AutomationRunRecord = { id: randomUUID(), ...run };
	withAutomationDatabase((db) => {
		db.prepare(`
			INSERT INTO automation_runs (id, automation_id, status, started_at, finished_at, exit_code, pid, session_path, log_path, error)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).run(record.id, record.automationId, record.status, record.startedAt, record.finishedAt, record.exitCode, record.pid, record.sessionPath, record.logPath, record.error);
	});
	return record;
}
