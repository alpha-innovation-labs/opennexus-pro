import type { HotkeysGroup } from "./types";

/**
 * Returns Nexus editor trigger shortcuts that are not Pi keybinding ids.
 *
 * @returns Static hotkeys groups.
 */
export function getStaticHotkeysGroups(): HotkeysGroup[] {
	return [
		{
			title: "Nexus Triggers",
			shortcuts: [
				{ label: "Open hotkeys", keys: "?" },
				{ label: "File paths", keys: "@" },
				{ label: "Commands menu", keys: "/" },
				{ label: "Run Bash command", keys: "!" },
				{ label: "Run Bash command outside context", keys: "!!" },
			],
		},
	];
}
