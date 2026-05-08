const teal = "\x1b[38;2;45;212;191m";
const reset = "\x1b[0m";

/** Applies a real teal foreground to the selected /SystemPrompt left-pane row. */
export function styleSelectedSystemPromptOutlineRow(text: string): string {
	return `${teal}${text}${reset}`;
}
