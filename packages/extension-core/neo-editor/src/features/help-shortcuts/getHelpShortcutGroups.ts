import {
	formatShortcut,
	getRegisteredShortcuts,
} from "@nexus/tui-kit/shortcuts/index";
import type { HelpShortcutGroup } from "./types";

/**
 * Returns the keyboard shortcuts shown in Neo's inline help modal.
 *
 * @returns Shortcut groups for the help modal.
 */
export function getHelpShortcutGroups(): HelpShortcutGroup[] {
	const registeredShortcuts = getRegisteredShortcuts().map((entry) => ({
		label: entry.description,
		keys: formatShortcut(entry.shortcut),
	}));
	return [
		{
			title: "Basics",
			shortcuts: [
				{ label: "Send", keys: "Enter" },
				{ label: "New line", keys: "\\ + Enter" },
				{ label: "Paste image", keys: "Ctrl + V" },
				{ label: "Clear input", keys: "Double Esc / Ctrl+C" },
				{ label: "Cancel / exit Bash", keys: "Esc" },
			],
		},
		{
			title: "Editor Triggers",
			shortcuts: [
				{ label: "Help shortcuts", keys: "?" },
				{ label: "File paths", keys: "@" },
				{ label: "Commands menu", keys: "/" },
				{ label: "Toggle Bash mode", keys: "!" },
			],
		},
		{
			title: "Modes",
			shortcuts: [
				{ label: "Change modes", keys: "Shift + Tab" },
				{ label: "Cycle reasoning level", keys: "Tab" },
				{ label: "Cycle AI model", keys: "Ctrl + N" },
				{ label: "Set autonomy", keys: "Ctrl + L" },
			],
		},
		{
			title: "Navigation",
			shortcuts: [
				{ label: "History or line navigation", keys: "↑/↓" },
				{ label: "Jump to line start/end", keys: "Cmd + ←/→" },
				{ label: "Delete word", keys: "Option + Delete" },
				{ label: "Delete line", keys: "Cmd + Delete" },
			],
		},
		{
			title: "Panels",
			shortcuts: [
				{ label: "Toggle detailed view", keys: "Ctrl + O" },
				{ label: "Collapse tool groups", keys: "Shift + Ctrl + C" },
			],
		},
		...(registeredShortcuts.length > 0
			? [{ title: "Registered Shortcuts", shortcuts: registeredShortcuts }]
			: []),
	];
}
