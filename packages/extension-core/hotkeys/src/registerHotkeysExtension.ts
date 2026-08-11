import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerHotkeysCommandHook } from "./registerHotkeysCommandHook";

/**
 * Registers the standalone hotkeys hotkeys extension.
 *
 * @param _pi Pi extension API.
 */
export function registerHotkeysExtension(_pi: ExtensionAPI): void {
	registerHotkeysCommandHook();
}
