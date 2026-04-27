/**
 * Checks whether a Pi theme directory entry is a loadable theme JSON asset.
 *
 * @param {{ isFile(): boolean, name: string }} entry Directory entry to inspect.
 * @returns {boolean} True when the entry should be copied as a runtime theme.
 */
export function isPiThemeAssetFile(entry) {
  return entry.isFile() && entry.name.endsWith(".json") && entry.name !== "theme-schema.json";
}
