import { getAutomationByIdOrName } from "./getAutomationByIdOrName.js";
import type { AutomationInput, AutomationRecord } from "./types.js";
import { withAutomationDatabase } from "./withAutomationDatabase.js";

/**
 * Updates an existing automation in SQLite.
 *
 * @param id Automation id.
 * @param input Updated automation fields.
 * @returns Updated automation record.
 */
export function updateAutomation(id: string, input: AutomationInput): AutomationRecord {
	const existing = getAutomationByIdOrName(id);
	const now = new Date().toISOString();
	withAutomationDatabase((db) => {
		db.prepare(`
			UPDATE automations
			SET name = ?, schedule_text = ?, cron_expression = ?, prompt = ?, cwd = ?, enabled = ?, updated_at = ?, next_run_at = ?
			WHERE id = ?
		`).run(input.name, input.scheduleText, input.cronExpression, input.prompt, input.cwd, input.enabled ? 1 : 0, now, input.nextRunAt, id);
	});
	return { id, createdAt: existing?.createdAt ?? now, updatedAt: now, ...input };
}
