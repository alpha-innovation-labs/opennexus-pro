import { getRegisteredShortcuts } from "@nexus/tui-kit/shortcuts/index.js";
import type { WhichKeyExtensionShortcut } from "./types.js";

/**
 * Returns extension shortcuts captured by Nexus's extension API proxy.
 *
 * @returns Registered extension shortcuts.
 */
export function getRegisteredWhichKeyShortcuts(): WhichKeyExtensionShortcut[] {
  return getRegisteredShortcuts();
}
