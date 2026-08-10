import type { SharedModalTheme } from "@nexus/tui-kit/modal/index";

/**
 * Creates the general slash menu helper footer line rendered above Search.
 *
 * @param theme Active UI theme.
 * @returns Footer helper text.
 */
export function createSlashMenuFooterHint(theme: SharedModalTheme): string {
  return theme.fg("muted", "Enter select · Esc close");
}
