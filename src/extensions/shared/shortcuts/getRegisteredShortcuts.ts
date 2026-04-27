import { registeredShortcuts } from "./state.js";
import type { RegisteredShortcut } from "./types.js";

/**
 * Returns shortcuts registered through the extension API proxy.
 *
 * @returns Registered extension shortcuts.
 */
export function getRegisteredShortcuts(): RegisteredShortcut[] {
  return [...registeredShortcuts];
}
