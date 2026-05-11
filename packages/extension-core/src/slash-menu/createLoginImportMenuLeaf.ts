import { createLoginImportLeaves } from "./createLoginImportLeaves.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds the import submenu leaf shown in the /login menu.
 *
 * @returns Import submenu leaf with the supported import source count.
 */
export function createLoginImportMenuLeaf(): SlashMenuLeaf {
	const importCount = createLoginImportLeaves().length;
	return {
		kind: "provider",
		label: `Import (${importCount})`,
		description: `${importCount} local auth sources available`,
		value: "import",
		groupLabel: "Import",
	};
}
