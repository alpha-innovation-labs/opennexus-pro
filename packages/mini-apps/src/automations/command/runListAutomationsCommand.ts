import { listAutomations } from "../core/storage/listAutomations.js";
import { formatAutomation } from "./formatAutomation.js";

/**
 * Runs the automations list command.
 *
 * @returns Exit code.
 */
export function runListAutomationsCommand(): number {
	const automations = listAutomations();
	if (automations.length === 0) {
		console.log("No automations found.");
		return 0;
	}
	for (const automation of automations) console.log(formatAutomation(automation));
	return 0;
}
