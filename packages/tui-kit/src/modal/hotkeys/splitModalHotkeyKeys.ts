/**
 * Splits a display hotkey into comparable key tokens.
 *
 * @param key Display key string, often slash-delimited.
 * @returns Comparable key tokens.
 */
export function splitModalHotkeyKeys(key: string): string[] {
  return key.split("/").map((part) => part.trim()).filter(Boolean);
}
