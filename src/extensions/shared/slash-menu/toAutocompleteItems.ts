import type { AutocompleteItem } from "@mariozechner/pi-tui";
import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";

/**
 * Converts slash-menu records into autocomplete items.
 *
 * @param records Menu records.
 * @returns Autocomplete items.
 */
export function toAutocompleteItems(records: Array<SlashMenuLeaf | SlashMenuSection>): AutocompleteItem[] {
  return records.map((record) => ({
    value: record.value,
    label: record.label,
    description: record.description,
  }));
}
