import { readEditorTriggerConfig } from "./readEditorTriggerConfig.js";
import { writeEditorTriggerConfig } from "./writeEditorTriggerConfig.js";

/**
 * Ensures an exact-match submit trigger exists for the provided editor text.
 *
 * @param cwd Project working directory.
 * @param text Exact text that should auto-submit.
 */
export async function ensureSubmitTrigger(cwd: string, text: string): Promise<void> {
	const config = await readEditorTriggerConfig(cwd);
	const exists = config.rules.some((rule) => rule.action?.type === "submit" && (rule.match?.mode ?? "exact") === "exact" && rule.match?.text === text);
	if (exists) return;
	config.rules.push({
		match: { text, mode: "exact" },
		action: { type: "submit" },
	});
	await writeEditorTriggerConfig(cwd, config);
}
