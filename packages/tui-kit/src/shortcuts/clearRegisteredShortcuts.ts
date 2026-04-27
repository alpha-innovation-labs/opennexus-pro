import { registeredShortcuts } from "./state.js";

/**
 * Clears the shortcut registry for deterministic tests.
 */
export function clearRegisteredShortcuts(): void {
  registeredShortcuts.length = 0;
}
