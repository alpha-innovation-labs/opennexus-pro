import { getTermVariableEntryPrefix } from "./getTermVariableEntryPrefix.js";
import { toStringRecord } from "./toStringRecord.js";

/**
 * Reads terminal variable entries from merged keybindings config.
 *
 * @param config Merged keybindings config.
 * @returns Variable dictionary for template resolution.
 */
export function readTermVariables(config: Record<string, unknown>): Record<string, string> {
	const prefix = getTermVariableEntryPrefix();
	const scopedEntries = Object.fromEntries(
		Object.entries(config)
			.filter(([key]) => key.startsWith(prefix))
			.map(([key, value]) => [key.slice(prefix.length), value]),
	);
	return toStringRecord(scopedEntries);
}
