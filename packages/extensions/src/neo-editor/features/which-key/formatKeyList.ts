import { formatShortcut } from "@nexus/tui-kit/shortcuts/index.js";

/**
 * Formats key ids for which-key display.
 *
 * @param keys Raw shortcut ids.
 * @returns Human-readable key list.
 */
export function formatKeyList(keys: string[]): string {
  return keys.map(formatShortcut).join(", ");
}
