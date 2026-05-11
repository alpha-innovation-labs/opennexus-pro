import type { ToolRegistrationRecord } from "./ToolRegistrationRecord.js";
import { registeredToolRecords } from "./registeredToolRecords.js";

/**
 * Returns extension tool registrations recorded during startup.
 *
 * @returns Recorded tool registrations.
 */
export function getRegisteredToolRecords(): ToolRegistrationRecord[] {
  return [...registeredToolRecords.values()];
}
