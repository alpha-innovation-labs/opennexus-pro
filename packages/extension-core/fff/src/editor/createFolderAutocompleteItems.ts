import type { AutocompleteItem } from "@earendil-works/pi-tui";
import { toAutocompleteItem } from "./toAutocompleteItem";

/**
 * Converts folder paths into autocomplete items.
 *
 * @param folderPaths Ranked folder paths.
 * @param isQuotedPrefix Whether the active prefix is quoted.
 * @returns Folder autocomplete items.
 */
export function createFolderAutocompleteItems(
  folderPaths: string[],
  isQuotedPrefix: boolean,
): AutocompleteItem[] {
  return folderPaths.map((folderPath) =>
    toAutocompleteItem(folderPath, `${folderPath}/`, `${folderPath}/ · folder`, isQuotedPrefix),
  );
}
