import { registeredShortcuts } from "./state";
import type { RegisteredShortcut } from "./types";

/**
 * Returns shortcuts registered through the extension API proxy.
 *
 * @returns Registered extension shortcuts.
 */
export function getRegisteredShortcuts(): RegisteredShortcut[] {
  return [...registeredShortcuts];
}
