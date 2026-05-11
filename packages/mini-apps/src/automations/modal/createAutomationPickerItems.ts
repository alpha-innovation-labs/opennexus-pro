import type { AutomationRecord } from "../core/storage/types.js";

/** Selectable automation picker item. */
export type AutomationPickerItem = {
	value: string;
	label: string;
	description: string;
};

/**
 * Converts automation records to picker rows.
 *
 * @param automations Automation records.
 * @returns Picker items.
 */
export function createAutomationPickerItems(automations: AutomationRecord[]): AutomationPickerItem[] {
	return automations.map((automation) => ({
		value: automation.id,
		label: automation.name,
		description: `${automation.enabled ? "enabled" : "disabled"} · ${automation.scheduleText} · ${automation.cwd}`,
	}));
}
