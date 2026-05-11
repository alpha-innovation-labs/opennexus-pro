import { listDueAutomations } from "../storage/listDueAutomations.js";
import { runDueAutomation } from "./runDueAutomation.js";

/**
 * Runs one scheduler tick for all currently due automations.
 */
export function runAutomationSchedulerTick(): void {
	for (const automation of listDueAutomations(new Date().toISOString())) {
		runDueAutomation(automation);
	}
}
