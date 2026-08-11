import { registeredToolRecords } from "./registeredToolRecords";
import type { ToolRegistrationRecord } from "./ToolRegistrationRecord";

/**
 * Returns extension tool registrations recorded during startup.
 *
 * @returns Recorded tool registrations.
 */
export function getRegisteredToolRecords(): ToolRegistrationRecord[] {
	return [...registeredToolRecords.values()];
}
