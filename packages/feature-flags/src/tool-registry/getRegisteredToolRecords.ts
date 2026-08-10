import type { ToolRegistrationRecord } from "./ToolRegistrationRecord";
import { registeredToolRecords } from "./registeredToolRecords";

/**
 * Returns extension tool registrations recorded during startup.
 *
 * @returns Recorded tool registrations.
 */
export function getRegisteredToolRecords(): ToolRegistrationRecord[] {
  return [...registeredToolRecords.values()];
}
