import { getNextRunAt } from "../schedule/getNextRunAt.js";
import { createAutomationRun } from "../storage/createAutomationRun.js";
import { getActiveRunForAutomation } from "../storage/getActiveRunForAutomation.js";
import type { AutomationRecord } from "../storage/types.js";
import { updateAutomationNextRunAt } from "../storage/updateAutomationNextRunAt.js";
import { spawnAutomationPromptRun } from "../runs/spawnAutomationPromptRun.js";

/**
 * Runs or skips one due automation and advances its next run time.
 *
 * @param automation Due automation record.
 */
export function runDueAutomation(automation: AutomationRecord): void {
	const now = new Date();
	const nextRunAt = getNextRunAt(automation.cronExpression, now).toISOString();
	const activeRun = getActiveRunForAutomation(automation.id);
	if (activeRun) {
		createAutomationRun({
			automationId: automation.id,
			status: "skipped",
			startedAt: now.toISOString(),
			finishedAt: now.toISOString(),
			exitCode: null,
			pid: null,
			sessionPath: null,
			logPath: null,
			error: "Previous run still active",
		});
		updateAutomationNextRunAt(automation.id, nextRunAt);
		return;
	}
	const run = createAutomationRun({ automationId: automation.id, status: "running", startedAt: now.toISOString(), finishedAt: null, exitCode: null, pid: null, sessionPath: null, logPath: null, error: null });
	updateAutomationNextRunAt(automation.id, nextRunAt);
	spawnAutomationPromptRun(automation, run);
}
