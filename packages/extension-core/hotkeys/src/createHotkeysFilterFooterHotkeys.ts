import type { SharedModalHotkey } from "@nexus/tui-kit";

/**
 * Creates footer hotkeys for active hotkeys-modal filtering.
 *
 * @returns Footer hotkey hints for filter mode.
 */
export function createHotkeysFilterFooterHotkeys(): SharedModalHotkey[] {
	return [
		{ key: "Backspace", label: "edits" },
		{ key: "Enter/Esc", label: "exits filter" },
	];
}
