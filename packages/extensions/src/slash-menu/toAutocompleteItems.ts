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
    resumeAge: (record as { resumeAge?: string }).resumeAge,
    resumeRow: (record as { resumeRow?: boolean }).resumeRow,
    wrapPreservedLabel: (record as { wrapPreservedLabel?: boolean }).wrapPreservedLabel,
    wrapToFit: (record as { wrapToFit?: boolean }).wrapToFit,
    sourcePath: (record as { sourcePath?: string }).sourcePath,
  }) as AutocompleteItem);
}
