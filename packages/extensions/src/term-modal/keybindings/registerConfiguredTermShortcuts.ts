import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { readTermShortcutBindings } from "./readTermShortcutBindings.js";
import { isUnsafeTermShortcut } from "./isUnsafeTermShortcut.js";
import { handleTermShortcut } from "../runtime/handleTermShortcut.js";
import type { TerminalState } from "../types.js";

/**
 * Registers terminal shortcuts declared in keybindings.json custom entries.
 *
 * @param pi Pi extension API.
 * @param state Terminal extension state.
 * @param cwd Active project working directory.
 */
export function registerConfiguredTermShortcuts(pi: ExtensionAPI, state: TerminalState, cwd: string): void {
	for (const binding of readTermShortcutBindings(cwd)) {
		for (const shortcut of binding.keys) {
			if (isUnsafeTermShortcut(shortcut)) {
				continue;
			}
			pi.registerShortcut(shortcut, {
				description: `${binding.description} (${shortcut} from keybindings.json).`,
				handler: async (ctx) => {
					await handleTermShortcut(state, binding, ctx);
				},
			});
		}
	}
}
