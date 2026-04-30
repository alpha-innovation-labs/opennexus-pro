import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@nexus/tui-kit/modal/index.js";
import type { ManagedExtensionRow } from "../model/types.js";

/**
 * Creates autocomplete items for managed extension rows.
 *
 * @param rows Rows to render.
 * @param theme Active UI theme.
 * @returns Selectable modal items.
 */
export function createManagedExtensionItems(
	rows: ManagedExtensionRow[],
	theme: ExtensionCommandContext["ui"]["theme"],
): AutocompleteItem[] {
	return rows.map((row) => ({
		label: `${row.id} ${theme.muted("›")} ${row.status} ${theme.muted(row.kind)}`,
		value: row.id,
	}));
}
