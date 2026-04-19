import { getTermShortcutConfigKey } from "./getTermShortcutConfigKey.js";
import { readMergedKeybindingConfig } from "./readMergedKeybindingConfig.js";

/**
 * Resolves extension shortcut keys from global and project keybindings files.
 *
 * @param cwd Active project working directory.
 * @returns Configured shortcut keys for toggling the terminal modal.
 */
export function readTermShortcutKeys(cwd: string): string[] {
	const config = readMergedKeybindingConfig(cwd);
	const value = config[getTermShortcutConfigKey()];
	if (typeof value === "string") {
		return [value];
	}
	if (Array.isArray(value)) {
		return value.filter((entry): entry is string => typeof entry === "string");
	}
	return [];
}
