import { buildAutomationInput } from "../command/buildAutomationInput.js";
import type { AutomationRecord } from "../core/storage/types.js";
import { updateAutomation } from "../core/storage/updateAutomation.js";
import type { AutomationAgentUpdate } from "../modal/types.js";

/**
 * Applies an agent-produced update to an automation and persists it.
 *
 * @param automation Current automation record.
 * @param update Agent update fields.
 * @returns Updated automation record.
 */
export function applyAutomationAgentUpdate(automation: AutomationRecord, update: AutomationAgentUpdate): AutomationRecord {
	const input = buildAutomationInput(
		update.name ?? automation.name,
		update.scheduleText ?? automation.scheduleText,
		update.prompt ?? automation.prompt,
		update.cwd ?? automation.cwd,
		update.enabled ?? automation.enabled,
	);
	return updateAutomation(automation.id, input);
}
