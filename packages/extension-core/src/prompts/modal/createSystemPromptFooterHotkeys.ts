import type { SharedModalOptions } from "@nexus/tui-kit/modal/index.js";

/**
 * Builds /SystemPrompt footer hotkeys without advertising hidden arrow-key support.
 *
 * @param canEdit Whether the editable user prompt content is selected.
 * @returns Footer hotkeys for the current selection.
 */
export function createSystemPromptFooterHotkeys(canEdit: boolean): NonNullable<SharedModalOptions["footerHotkeys"]> {
	return [
		{ key: "Tab/h/l", label: "focus" },
		{ key: "j/k", label: "move/scroll" },
		...(canEdit ? [{ key: "e", label: "edit" }] : []),
		{ key: "q", label: "close" },
	];
}
