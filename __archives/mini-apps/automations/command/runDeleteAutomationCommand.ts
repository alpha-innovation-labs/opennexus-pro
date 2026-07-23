import { deleteAutomation } from "../core/storage/deleteAutomation.js";
import { getAutomationByIdOrName } from "../core/storage/getAutomationByIdOrName.js";
import { readPositional } from "./readPositional.js";

/**
 * Runs the automations delete command.
 *
 * @param argv Raw command args.
 * @returns Exit code.
 */
export function runDeleteAutomationCommand(argv: readonly string[]): number {
	const target = readPositional(argv, 2);
	if (!target) {
		console.error("Usage: nexus automations delete <id|name>");
		return 1;
	}
	const existing = getAutomationByIdOrName(target);
	if (!existing) {
		console.error(`Automation not found: ${target}`);
		return 1;
	}
	deleteAutomation(existing.id);
	console.log(`Deleted automation: ${existing.name}`);
	return 0;
}
