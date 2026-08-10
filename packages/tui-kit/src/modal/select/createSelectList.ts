import type { AutocompleteItem } from "@earendil-works/pi-tui";
import { PlainSelectList } from "./PlainSelectList";
import type { SelectPreviewItemStyleFns, SelectPreviewTheme } from "./types";

/**
 * Creates a selectable list instance.
 *
 * @param theme UI theme.
 * @param maxVisible Visible row count.
 * @param onPick Pick callback.
 * @param onClose Close callback.
 * @param onSelectionChange Selection callback.
 * @param styles Optional item styles.
 * @param itemMaxLines Optional per-item max line callback.
 * @param items Initial items.
 * @returns Select list instance.
 */
export function createSelectList(
  theme: SelectPreviewTheme,
  maxVisible: number,
  onPick: (item: AutocompleteItem) => void,
  onClose: () => void,
  onSelectionChange: ((item: AutocompleteItem | null) => void) | undefined,
  styles: SelectPreviewItemStyleFns | undefined,
  itemMaxLines: ((item: AutocompleteItem) => number) | undefined,
  items: AutocompleteItem[],
): PlainSelectList {
  const list = new PlainSelectList(theme, maxVisible, onPick, onClose, onSelectionChange, styles, itemMaxLines);
  list.setItems(items);
  return list;
}
