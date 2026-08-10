import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index";
import { wrapSystemPromptLine } from "./wrapSystemPromptLine";

/**
 * Renders the current system prompt as wrapped modal content.
 *
 * @param prompt Prompt text to display.
 * @param width Available modal pane width.
 * @param theme Modal theme used for dim empty-state styling.
 * @returns Modal-safe display rows.
 */
export function renderSystemPromptLines(
	prompt: string,
	width: number,
	theme: SelectPreviewTheme,
): string[] {
	const trimmedWidth = Math.max(1, width - 2);
	if (prompt.trim().length === 0)
		return [theme.fg("dim", "No system prompt is set.")];

	return prompt
		.split("\n")
		.flatMap((line) => wrapSystemPromptLine(line, trimmedWidth));
}
