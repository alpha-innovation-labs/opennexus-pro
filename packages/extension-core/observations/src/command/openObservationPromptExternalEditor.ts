import type { TUI } from "@earendil-works/pi-tui";
import { openSystemPromptExternalEditor } from "@extensions/prompts/modal/openSystemPromptExternalEditor.js";

/**
 * Opens the observation prompt in the configured external editor.
 *
 * @param tui TUI instance to stop while the editor owns the terminal.
 * @param prompt Current prompt content.
 * @returns Updated prompt when saved successfully.
 */
export function openObservationPromptExternalEditor(tui: TUI, prompt: string): string | undefined {
	return openSystemPromptExternalEditor(tui, prompt);
}
