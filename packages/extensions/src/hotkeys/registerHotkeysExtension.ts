import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerHotkeysCommandHook } from "./registerHotkeysCommandHook.js";

/**
 * Registers the standalone hotkeys hotkeys extension.
 *
 * @param _pi Pi extension API.
 */
export function registerHotkeysExtension(_pi: ExtensionAPI): void {
  registerHotkeysCommandHook();
}
