import type { AutocompleteItem } from "@earendil-works/pi-tui";

/**
 * Converts an FFF file candidate into a UI autocomplete item.
 *
 * @param relativePath Candidate relative path.
 * @param label Display label.
 * @param description Display description.
 * @param isQuotedPrefix Whether the active prefix is quoted.
 * @returns Autocomplete item.
 */
export function toAutocompleteItem(
  relativePath: string,
  label: string,
  description: string,
  isQuotedPrefix: boolean,
): AutocompleteItem {
  const path = relativePath.replace(/\\/g, "/");
  const needsQuotes = isQuotedPrefix || path.includes(" ");
  return {
    value: needsQuotes ? `@"${path}"` : `@${path}`,
    label,
    description,
  };
}
