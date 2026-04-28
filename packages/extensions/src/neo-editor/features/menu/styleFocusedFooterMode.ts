/**
 * Styles the focused resource pane label with white text on a dark red background.
 *
 * @param label Focused pane label.
 * @returns ANSI-styled label.
 */
export function styleFocusedFooterMode(label: string): string {
  return `\x1b[97;48;5;88m ${label} \x1b[0m`;
}
