import type { EditorTriggerConfig, EditorTriggerRule } from "./types";

/**
 * Finds the first configured trigger matching the current editor text.
 *
 * @param config Loaded trigger config.
 * @param text Current editor text.
 * @returns First matching rule, if any.
 */
export function findMatchingTrigger(
	config: EditorTriggerConfig,
	text: string,
): EditorTriggerRule | undefined {
	return config.rules.find((rule) => {
		const mode = rule.match.mode ?? "exact";
		if (mode === "startsWith") return text.startsWith(rule.match.text);
		if (mode === "includes") return text.includes(rule.match.text);
		return text === rule.match.text;
	});
}
