import type { TermShortcutBinding } from "../types.js";
import { getTermShortcutEntryPrefix } from "./getTermShortcutEntryPrefix.js";
import { readMergedKeybindingConfig } from "./readMergedKeybindingConfig.js";
import { readTermShortcutKeys } from "./readTermShortcutKeys.js";
import { readTermVariables } from "./readTermVariables.js";
import { toTermShortcutBinding } from "./toTermShortcutBinding.js";

/**
 * Reads toggle and command shortcuts for the terminal extension.
 *
 * @param cwd Active project working directory.
 * @returns Parsed terminal shortcut bindings.
 */
export function readTermShortcutBindings(cwd: string): TermShortcutBinding[] {
	const config = readMergedKeybindingConfig(cwd);
	const variables = readTermVariables(config);
	const bindings: TermShortcutBinding[] = [];
	const toggleKeys = readTermShortcutKeys(cwd);
	if (toggleKeys.length) {
		bindings.push({
			name: "toggle",
			keys: toggleKeys,
			description: "Toggle the floating terminal modal.",
			command: null,
		});
	}
	const prefix = getTermShortcutEntryPrefix();
	for (const [key, value] of Object.entries(config)) {
		if (!key.startsWith(prefix)) {
			continue;
		}
		const binding = toTermShortcutBinding(key.slice(prefix.length), value, variables);
		if (binding) {
			bindings.push(binding);
		}
	}
	return bindings;
}
