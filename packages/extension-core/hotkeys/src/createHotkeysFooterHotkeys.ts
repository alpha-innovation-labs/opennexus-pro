import type { SharedModalHotkey } from "@nexus/tui-kit";

/**
 * Creates normal navigation footer hotkeys for the hotkeys modal.
 *
 * @param scrollOffset Current scroll offset.
 * @param maxScroll Maximum scroll offset.
 * @returns Footer hotkey hints for normal hotkeys browsing.
 */
export function createHotkeysFooterHotkeys(
	scrollOffset: number,
	maxScroll: number,
): SharedModalHotkey[] {
	return [
		{ key: "j/k", label: `scroll ${scrollOffset}/${maxScroll}` },
		{ key: "gg", label: "top" },
		{ key: "G", label: "bottom" },
		{ key: "/", label: "filter" },
		{ key: "Esc/Ctrl+C/?", label: "closes" },
		{ key: "q", label: "closes" },
	];
}
