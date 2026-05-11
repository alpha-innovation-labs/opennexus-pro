import { registeredToolRecords } from "./registeredToolRecords.js";

/**
 * Clears recorded extension tool registrations before an extension reload.
 */
export function clearRegisteredToolRecords(): void {
  registeredToolRecords.clear();
}
