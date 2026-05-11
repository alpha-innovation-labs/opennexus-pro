import type { AutomationRecord } from "./types.js";

type AutomationRow = Record<string, unknown>;

/**
 * Converts a SQLite automation row to the public record shape.
 *
 * @param row Raw SQLite row.
 * @returns Automation record.
 */
export function mapAutomationRow(row: AutomationRow): AutomationRecord {
	return {
		id: String(row.id),
		name: String(row.name),
		scheduleText: String(row.schedule_text),
		cronExpression: String(row.cron_expression),
		prompt: String(row.prompt),
		cwd: String(row.cwd),
		enabled: Number(row.enabled) === 1,
		createdAt: String(row.created_at),
		updatedAt: String(row.updated_at),
		nextRunAt: row.next_run_at === null ? null : String(row.next_run_at),
	};
}
