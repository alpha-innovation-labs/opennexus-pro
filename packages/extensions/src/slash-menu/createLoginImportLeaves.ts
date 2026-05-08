import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds credential import leaves for the /login import submenu.
 *
 * @returns Import leaves for supported local auth sources.
 */
export function createLoginImportLeaves(): SlashMenuLeaf[] {
	return [
		{
			kind: "provider",
			label: "Import from Pi",
			description: "Copy missing credentials from ~/.pi/agent/auth.json",
			value: "import:pi",
			groupLabel: "Import",
		},
		{
			kind: "provider",
			label: "Import from OpenCode",
			description: "Copy missing credentials from OpenCode auth.json",
			value: "import:opencode",
			groupLabel: "Import",
		},
	];
}
