import type { AutomationRunRecord } from "./types.js";

type AutomationRunRow = Record<string, unknown>;

/**
 * Converts a SQLite run row to the public record shape.
 *
 * @param row Raw SQLite row.
 * @returns Automation run record.
 */
export function mapAutomationRunRow(row: AutomationRunRow): AutomationRunRecord {
	return {
		id: String(row.id),
		automationId: String(row.automation_id),
		status: row.status as AutomationRunRecord["status"],
		startedAt: String(row.started_at),
		finishedAt: row.finished_at === null ? null : String(row.finished_at),
		exitCode: row.exit_code === null ? null : Number(row.exit_code),
		pid: row.pid === null ? null : Number(row.pid),
		sessionPath: row.session_path === null ? null : String(row.session_path),
		logPath: row.log_path === null ? null : String(row.log_path),
		error: row.error === null ? null : String(row.error),
	};
}
