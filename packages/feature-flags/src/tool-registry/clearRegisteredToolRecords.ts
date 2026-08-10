import { registeredToolRecords } from "./registeredToolRecords";

/**
 * Clears recorded extension tool registrations before an extension reload.
 */
export function clearRegisteredToolRecords(): void {
  registeredToolRecords.clear();
}
