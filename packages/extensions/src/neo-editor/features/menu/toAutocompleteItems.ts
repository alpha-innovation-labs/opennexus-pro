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
    groupLabel: record.groupLabel,
    preserveLabelWhitespace: (record as { preserveLabelWhitespace?: boolean }).preserveLabelWhitespace,
    treeRole: (record as { treeRole?: string }).treeRole,
    treeFocusEntryId: (record as { treeFocusEntryId?: string }).treeFocusEntryId,
    treeParentUserId: (record as { treeParentUserId?: string }).treeParentUserId,
  }) as AutocompleteItem);
}
