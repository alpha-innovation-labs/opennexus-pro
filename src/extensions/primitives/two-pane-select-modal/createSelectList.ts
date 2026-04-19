import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { PlainSelectList } from "./PlainSelectList.js";
import type { ItemStyleFns, UITheme } from "./types.js";

/**
 * Creates the select-list instance used by the modal.
 *
 * @param theme UI theme.
 * @param maxVisible Visible row count.
 * @param onPick Pick callback.
 * @param onClose Close callback.
 * @param onSelectionChange Selection callback.
 * @param styles Optional item styles.
 * @param items Initial items.
 * @returns Select list instance.
 */
export function createSelectList(
	theme: UITheme,
	maxVisible: number,
	onPick: (item: AutocompleteItem) => void,
	onClose: () => void,
	onSelectionChange: ((item: AutocompleteItem | null) => void) | undefined,
	styles: ItemStyleFns | undefined,
	itemMaxLines: ((item: AutocompleteItem) => number) | undefined,
	items: AutocompleteItem[],
): PlainSelectList {
	const list = new PlainSelectList(theme, maxVisible, onPick, onClose, onSelectionChange, styles, itemMaxLines);
	list.setItems(items);
	return list;
}
