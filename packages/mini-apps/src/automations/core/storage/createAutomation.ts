import { randomUUID } from "node:crypto";
import type { AutomationInput, AutomationRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Inserts a new automation into SQLite.
 *
 * @param input Automation fields.
 * @returns Created automation record.
 */
export function createAutomation(input: AutomationInput): AutomationRecord {
	const now = new Date().toISOString();
	const record: AutomationRecord = { id: randomUUID(), createdAt: now, updatedAt: now, ...input };
	withAutomationDatabase((db) => {
		db.prepare(`
			INSERT INTO automations (id, name, schedule_text, cron_expression, prompt, cwd, enabled, created_at, updated_at, next_run_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).run(record.id, record.name, record.scheduleText, record.cronExpression, record.prompt, record.cwd, record.enabled ? 1 : 0, record.createdAt, record.updatedAt, record.nextRunAt);
	});
	return record;
}
