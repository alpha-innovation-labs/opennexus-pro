/**
 * Formats a shortcut id for display in help panels.
 *
 * @param shortcut Registered shortcut id.
 * @returns Human-readable shortcut label.
 */
export function formatShortcut(shortcut: string): string {
  return shortcut
    .split("+")
    .map((part) => part.length === 1 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" + ");
}
