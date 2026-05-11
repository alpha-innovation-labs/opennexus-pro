/**
 * Converts one keybinding config value into a normalized key list.
 *
 * @param value Raw keybinding value from Pi.
 * @returns Configured keys with empty entries removed.
 */
export function toKeyList(value: string | string[] | undefined): string[] {
  if (typeof value === "string") return value.length > 0 ? [value] : [];
  if (Array.isArray(value)) return value.filter((key) => key.length > 0);
  return [];
}
