import { formatShortcut } from "@nexus/tui-kit/shortcuts/index";
import type { HotkeysExtensionShortcut, HotkeysGroup } from "./types";

/**
 * Converts extension shortcut registrations into a hotkeys group.
 *
 * @param shortcuts Extension shortcuts.
 * @returns Extension shortcut group, when any shortcuts exist.
 */
export function toHotkeysExtensionGroup(
	shortcuts: HotkeysExtensionShortcut[],
): HotkeysGroup | undefined {
	if (shortcuts.length === 0) return undefined;
	return {
		title: "Extensions",
		shortcuts: shortcuts.map((shortcut) => ({
			label:
				shortcut.description ?? shortcut.extensionPath ?? shortcut.shortcut,
			keys: formatShortcut(shortcut.shortcut),
		})),
	};
}
