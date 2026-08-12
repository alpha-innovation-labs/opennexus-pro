import { getRegisteredShortcuts } from "@nexus/tui-kit";
import type { HotkeysExtensionShortcut } from "./types";

/**
 * Returns extension shortcuts captured by Nexus's extension API proxy.
 *
 * @returns Registered extension shortcuts.
 */
export function getRegisteredHotkeysShortcuts(): HotkeysExtensionShortcut[] {
	return getRegisteredShortcuts();
}
