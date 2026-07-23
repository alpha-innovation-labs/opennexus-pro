import { resolve } from "node:path";
import { getNextRunAt } from "../core/schedule/getNextRunAt.js";
import { normalizeSchedule } from "../core/schedule/normalizeSchedule.js";
import type { AutomationInput } from "../core/storage/types.js";

/**
 * Builds normalized automation input from CLI field values.
 *
 * @param name Automation name.
 * @param scheduleText Schedule text.
 * @param prompt Prompt body.
 * @param cwd Working directory.
 * @param enabled Whether the automation is enabled.
 * @returns Normalized automation input.
 */
export function buildAutomationInput(name: string, scheduleText: string, prompt: string, cwd: string, enabled: boolean): AutomationInput {
	const cronExpression = normalizeSchedule(scheduleText);
	return {
		name,
		scheduleText,
		cronExpression,
		prompt,
		cwd: resolve(cwd),
		enabled,
		nextRunAt: enabled ? getNextRunAt(cronExpression).toISOString() : null,
	};
}
