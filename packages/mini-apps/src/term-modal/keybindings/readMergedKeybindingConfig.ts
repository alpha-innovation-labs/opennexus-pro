import { getTermKeybindingPaths } from "./getTermKeybindingPaths.js";
import { readKeybindingConfig } from "./readKeybindingConfig.js";

/**
 * Reads global and project keybindings and merges them with project precedence.
 *
 * @param cwd Active project working directory.
 * @returns Merged keybinding config object.
 */
export function readMergedKeybindingConfig(cwd: string): Record<string, unknown> {
	const merged: Record<string, unknown> = {};
	for (const path of getTermKeybindingPaths(cwd)) {
		Object.assign(merged, readKeybindingConfig(path));
	}
	return merged;
}
