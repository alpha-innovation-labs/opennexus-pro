import { registeredShortcuts } from "./state";

/**
 * Clears the shortcut registry for deterministic tests.
 */
export function clearRegisteredShortcuts(): void {
	registeredShortcuts.length = 0;
}
